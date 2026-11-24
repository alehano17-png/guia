// Herramienta de desarrollo: genera la narración de un tour con la voz de
// GUÍA (OpenAI Realtime, el mismo modelo y voz de la conversación), la
// revisa, y la guarda en Supabase Storage (bucket privado "narrations") con
// una copia local en .cache/narration/ para escucharla.
//
//   npm run generar-narracion -- <tourId> [opciones]
//     --idioma es|en     solo ese idioma (por defecto, los dos)
//     --paso <stepId>    solo ese paso (su narración y su pregunta "¿Llegaste?")
//     --tope <US$>       no gastar más que esto (por defecto 1,50)
//     --reemplazar       regenera aunque el texto no haya cambiado
//     --prueba           solo el primer fragmento del paso de --paso; lo deja
//                        en la copia local y no sube nada
//     --fragmentos N     solo con --prueba: los primeros N fragmentos del paso,
//                        unidos con sus silencios en un solo archivo
//     --modelo <nombre>  genera con otro modelo, y
//     --voz <nombre>     con otra voz, SOLO para comparar: no sube nada ni
//                        toca el manifest; la copia local queda en
//                        .cache/narration-comparar/<modelo>-<voz>/. Sin estas
//                        opciones se usan REALTIME_MODEL y REALTIME_VOICE
//                        (backend/realtimeConfig.js). Solo modelos con
//                        precios en cost.ts.
//
// Llaves: lee OPENAI_API_KEY, SUPABASE_URL y SUPABASE_SECRET_KEY de
// backend/.env. Nunca las imprime ni las copia a otro lado.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import {
  REALTIME_MODEL,
  REALTIME_REASONING_EFFORT,
  REALTIME_VOICE,
  VALID_TOUR_IDS,
} from "../../backend/realtimeConfig.js";
import { getTourArrivalTarget } from "../../data/tours/arrival";
import { getAvailableTourLocales, getTourById } from "../../data/tours";
import type { Tour } from "../../data/tours/types";
import { concatPcm, durationSeconds, encodeMp3, silence, trimSilence } from "./audio";
import {
  DEFAULT_BUDGET_USD,
  estimateResponseCost,
  formatUsd,
  REALTIME_PRICES,
  usageCost,
  type ModelPrices,
} from "./cost";
import {
  arrivalInput,
  arrivalInstructions,
  LISTEN_BUTTON_WORD,
  narrationInstructions,
  type Language,
} from "./instructions";
import { RealtimeSpeaker } from "./realtime";
import { createStorage, type Manifest, type Storage } from "./storage";
import {
  arrivalPhraseProblems,
  buildAlignment,
  hashOf,
  MICRO_PAUSE_SECONDS,
  missingNumbers,
  PARAGRAPH_PAUSE_SECONDS,
  PAUSE_SECONDS,
  splitVoiceText,
  wordMatchRatio,
  type SplitText,
} from "./text";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, "backend/.env");
const LOCAL_DIR = path.join(ROOT, ".cache/narration");
// Copias con otro modelo u otra voz, solo para escuchar y comparar.
const COMPARE_DIR = path.join(ROOT, ".cache/narration-comparar");
// Voces de OpenAI Realtime (guía de conversaciones en tiempo real, noviembre
// de 2026: https://developers.openai.com/api/docs/guides/realtime-conversations).
const REALTIME_VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse", "marin", "cedar"];

// Subir este número regenera todo (por ejemplo, si cambia cómo se une el
// audio).
const NARRATION_FORMAT_VERSION = 1;
const MIN_WORD_MATCH = 0.97;
const MAX_ATTEMPTS = 3; // 1 + 2 reintentos

// Modelos a los que no se les manda "reasoning.effort" (si alguno no lo
// acepta). Hoy ninguno: gpt-realtime-2.1-mini también lo aceptó.
const MODELS_WITHOUT_REASONING_EFFORT = new Set<string>();

type Options = {
  tourId: string;
  languages: Language[];
  stepId?: string;
  budget: number;
  replace: boolean;
  trial: boolean;
  // Solo con --prueba: cuántos fragmentos (sin la opción, uno).
  trialFragments?: number;
  model: string;
  voice: string;
};

function usage(message: string): never {
  console.error(message);
  console.error("Uso: npm run generar-narracion -- <tourId> [--idioma es|en] [--paso <stepId>] [--tope <US$>] [--reemplazar] [--prueba [--fragmentos N]] [--modelo <nombre>] [--voz <nombre>]");
  process.exit(1);
}

function parseOptions(argv: string[]): Options {
  const options: Options = { tourId: "", languages: ["es", "en"], budget: DEFAULT_BUDGET_USD, replace: false, trial: false, model: REALTIME_MODEL, voice: REALTIME_VOICE };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => argv[++i] ?? usage(`Falta el valor de ${arg}`);
    if (arg === "--idioma") {
      const language = value();
      if (language !== "es" && language !== "en") usage(`Idioma inválido: ${language}`);
      options.languages = [language];
    } else if (arg === "--paso") options.stepId = value();
    else if (arg === "--tope") {
      const budget = Number(value().replace(",", "."));
      if (!Number.isFinite(budget) || budget <= 0) usage("El tope debe ser un número mayor que 0");
      options.budget = budget;
    } else if (arg === "--reemplazar") options.replace = true;
    else if (arg === "--prueba") options.trial = true;
    else if (arg === "--fragmentos") {
      const count = value();
      if (!/^[1-9]\d*$/.test(count)) usage(`--fragmentos debe ser un número entero mayor que 0, no "${count}"`);
      options.trialFragments = Number(count);
    } else if (arg === "--modelo") {
      const model = value();
      // También es nombre de carpeta: solo letras, números, puntos y guiones.
      if (!/^[a-z0-9][a-z0-9.-]{0,63}$/i.test(model)) usage(`Nombre de modelo inválido: ${model}`);
      options.model = model;
    } else if (arg === "--voz") {
      const voice = value();
      if (!REALTIME_VOICES.includes(voice)) usage(`Voz desconocida: ${voice}. Voces: ${REALTIME_VOICES.join(", ")}`);
      options.voice = voice;
    } else if (arg.startsWith("--")) usage(`Opción desconocida: ${arg}`);
    else if (!options.tourId) options.tourId = arg;
    else usage(`Argumento de más: ${arg}`);
  }
  if (!options.tourId) usage("Falta el tourId");
  if (!(VALID_TOUR_IDS as string[]).includes(options.tourId)) usage(`Tour desconocido: ${options.tourId}`);
  if (options.trial && !options.stepId) usage("--prueba necesita --paso");
  if (options.trialFragments !== undefined && !options.trial) usage("--fragmentos solo se usa con --prueba");
  return options;
}

// Solo las variables que hacen falta; nunca se imprimen sus valores.
function readEnv(names: string[]): Record<string, string> {
  const env = parseEnv(readFileSync(ENV_PATH, "utf8"));
  const missing = names.filter((name) => !env[name]);
  if (missing.length) {
    console.error(`Faltan en backend/.env: ${missing.join(", ")}`);
    process.exit(1);
  }
  return Object.fromEntries(names.map((name) => [name, env[name]!]));
}

type Job =
  | { kind: "narration"; stepId: string; file: string; hash: string; split: SplitText; instructions: string }
  | { kind: "arrival"; stepId: string; file: string; hash: string; placeTitle: string; instructions: string };

type Row = {
  label: string;
  language: Language;
  duration: string;
  attempts: string;
  match: string;
  cost: number;
  status: "ok" | "revisar" | "sin cambios" | "sin generar (tope)";
};

function narrationJobs(tour: Tour, language: Language, model: string, voice: string, stepId?: string): Job[] {
  const instructions = narrationInstructions(language);
  return tour.steps
    .filter((step) => step.voiceText?.trim() && (!stepId || step.id === stepId))
    .map((step) => ({
      kind: "narration" as const,
      stepId: step.id,
      file: `${step.id}.mp3`,
      hash: hashOf({
        v: NARRATION_FORMAT_VERSION,
        model,
        voice,
        instructions,
        silences: [MICRO_PAUSE_SECONDS, PAUSE_SECONDS, PARAGRAPH_PAUSE_SECONDS],
        text: step.voiceText,
      }),
      split: splitVoiceText(step.voiceText),
      instructions,
    }));
}

// Una pregunta por cada lugar al que el GPS puede apuntar (la misma regla de
// la app: data/tours/arrival.ts).
function arrivalJobs(tour: Tour, language: Language, model: string, voice: string, stepId?: string): Job[] {
  const instructions = arrivalInstructions(language);
  const places = new Map<string, string>();
  for (const step of tour.steps) {
    const target = getTourArrivalTarget({
      steps: tour.steps,
      step,
      isGuidedStart: !!step.startRoute,
      startRoute: step.startRoute,
      enclosed: tour.enclosed,
    });
    if (target && !places.has(target.nextStepId)) places.set(target.nextStepId, target.title);
  }
  return [...places]
    .filter(([id]) => !stepId || id === stepId)
    .map(([id, placeTitle]) => ({
      kind: "arrival" as const,
      stepId: id,
      file: `arrival/${id}.mp3`,
      hash: hashOf({ v: NARRATION_FORMAT_VERSION, model, voice, instructions, placeTitle }),
      placeTitle,
      instructions,
    }));
}

// Lo que se le pide decir al modelo, una respuesta por elemento. Sin límite
// (generación normal) van todos los fragmentos.
function requestsOf(job: Job, language: Language, limit: number | undefined): { text: string; expected?: string }[] {
  if (job.kind === "arrival") return [{ text: arrivalInput(language, job.placeTitle) }];
  return job.split.fragments.slice(0, limit).map((f) => ({ text: f.text, expected: f.text }));
}

function estimateRequest(prices: ModelPrices, job: Job, text: string): number {
  return estimateResponseCost(prices, job.instructions.length, job.kind === "arrival" ? 90 : text.length);
}

function estimateJob(prices: ModelPrices, job: Job, language: Language, limit: number | undefined): number {
  return requestsOf(job, language, limit).reduce((sum, r) => sum + estimateRequest(prices, job, r.text), 0);
}

function writeLocal(baseDir: string, relativePath: string, data: Buffer | string) {
  const full = path.join(baseDir, relativePath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, data);
  return full;
}

class BudgetReached extends Error {}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const model = options.model;
  const prices = REALTIME_PRICES[model];
  if (!prices) {
    console.error(
      `No hay precios conocidos para el modelo "${model}": no se genera nada. Modelos con precios: ${Object.keys(REALTIME_PRICES).join(", ")}. Para usar otro, agrega sus precios en scripts/generar-narracion/cost.ts.`
    );
    process.exit(1);
  }
  const voice = options.voice;
  // Otro modelo u otra voz que los de la app: solo para comparar (nada a
  // Supabase). La carpeta lleva los dos, para que ninguna copia pise a otra.
  const compareOnly = model !== REALTIME_MODEL || voice !== REALTIME_VOICE;
  const localOnly = options.trial || compareOnly;
  // Solo en la prueba: cuántos fragmentos del paso (por defecto, el primero).
  const fragmentLimit = options.trial ? (options.trialFragments ?? 1) : undefined;
  const localDir = compareOnly ? path.join(COMPARE_DIR, `${model}-${voice}`) : LOCAL_DIR;
  const reasoningEffort = MODELS_WITHOUT_REASONING_EFFORT.has(model) ? undefined : REALTIME_REASONING_EFFORT;

  const env = readEnv(localOnly ? ["OPENAI_API_KEY"] : ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SECRET_KEY"]);
  const storage: Storage | null = localOnly ? null : createStorage(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

  console.log(`Tour ${options.tourId} | modelo ${model} | voz ${voice} | razonamiento ${reasoningEffort ?? "(no se manda)"} | tope ${formatUsd(options.budget)}`);
  console.log(`Precios: ${model}, ${prices.source} (${prices.date}).`);
  if (compareOnly) {
    console.log(
      `Solo para comparar: la app usa ${REALTIME_MODEL} con voz ${REALTIME_VOICE}. No se sube nada a Supabase ni se toca el manifest; la copia local queda en ${localDir}.`
    );
  }
  if (storage) console.log(`Bucket "narrations": ${await storage.ensurePrivateBucket()} (privado).`);

  // Qué hay que generar, por idioma.
  const plans: { language: Language; manifest: Manifest; toGenerate: Job[]; unchanged: Job[] }[] = [];
  const available = getAvailableTourLocales(options.tourId);
  for (const language of options.languages) {
    if (!available.includes(language)) {
      console.log(`${language}: el tour no tiene contenido en este idioma; se salta.`);
      continue;
    }
    const tour = getTourById(options.tourId, language)!;
    const jobs = [
      ...narrationJobs(tour, language, model, voice, options.stepId),
      ...(options.trial ? [] : arrivalJobs(tour, language, model, voice, options.stepId)),
    ];
    if (options.stepId && !jobs.length) usage(`El paso "${options.stepId}" no existe o no tiene texto en ${language}`);
    if (fragmentLimit !== undefined) {
      for (const job of jobs) {
        if (job.kind === "narration" && fragmentLimit > job.split.fragments.length) {
          usage(`El paso "${job.stepId}" tiene ${job.split.fragments.length} fragmentos en ${language}: no se puede pedir ${fragmentLimit}`);
        }
      }
    }

    // Sin Supabase (prueba o comparar) no se lee el manifest: se genera todo
    // lo pedido.
    const manifest: Manifest = (storage && (await storage.readManifest(options.tourId, language))) || {
      tourId: options.tourId,
      language,
      model,
      voice,
      files: {},
    };
    const isUnchanged = (job: Job) => !localOnly && !options.replace && manifest.files[job.file]?.hash === job.hash;
    plans.push({ language, manifest, toGenerate: jobs.filter((j) => !isUnchanged(j)), unchanged: jobs.filter(isUnchanged) });
  }

  // Estimado ANTES de generar.
  let estimate = 0;
  for (const plan of plans) {
    const value = plan.toGenerate.reduce((sum, job) => sum + estimateJob(prices, job, plan.language, fragmentLimit), 0);
    estimate += value;
    const steps = plan.toGenerate.filter((j) => j.kind === "narration").length;
    const questions = plan.toGenerate.length - steps;
    console.log(
      `${plan.language}: ${steps} narraciones y ${questions} preguntas por generar, ${plan.unchanged.length} sin cambios. Estimado ${formatUsd(value)}.`
    );
  }
  console.log(`Estimado total: ${formatUsd(estimate)} (si hay que repetir fragmentos, cada repetición se cobra aparte). Tope: ${formatUsd(options.budget)}.`);
  if (estimate > options.budget) {
    console.log("El estimado pasa el tope: no se genera nada. Para permitirlo, usa --tope con un valor mayor.");
    process.exit(2);
  }

  const apiKey = env.OPENAI_API_KEY;
  const rows: Row[] = [];
  const notes: string[] = [];
  let spent = 0;
  // Para el tope cuenta lo mayor entre el costo real y el estimado de cada
  // respuesta (por si OpenAI informa de menos: en la prueba corta informó
  // 0 tokens de entrada).
  let budgetUsed = 0;
  let stopped = false;

  for (const plan of plans) {
    const { language, manifest } = plan;
    for (const job of plan.unchanged) {
      const entry = manifest.files[job.file];
      rows.push({ label: job.kind === "arrival" ? job.file.replace(".mp3", "") : job.stepId, language, duration: `${entry.durationSeconds.toFixed(1)} s`, attempts: "-", match: "-", cost: 0, status: "sin cambios" });
    }

    for (const job of plan.toGenerate) {
      const label = job.kind === "arrival" ? job.file.replace(".mp3", "") : job.stepId;
      const row: Row = { label, language, duration: "-", attempts: "-", match: "-", cost: 0, status: "sin generar (tope)" };
      rows.push(row);
      if (stopped) continue;

      const requests = requestsOf(job, language, fragmentLimit);
      const pieces: Int16Array[] = [];
      let attempts = 0;
      let worstMatch = 1;
      let failed = false;
      const speaker = await RealtimeSpeaker.open({ apiKey, model, voice });
      try {
        for (const [index, request] of requests.entries()) {
          let accepted: Int16Array | null = null;
          let lastProblem = "";
          for (let attempt = 1; attempt <= MAX_ATTEMPTS && !accepted; attempt++) {
            const next = estimateRequest(prices, job, request.text);
            if (budgetUsed + next > options.budget) throw new BudgetReached();
            attempts++;
            const result = await speaker.speak(job.instructions, request.text, reasoningEffort);
            const cost = usageCost(prices, result.usage);
            spent += cost;
            budgetUsed += Math.max(cost, next);
            row.cost += cost;

            const problems: string[] = [];
            if (result.problem) problems.push(result.problem);
            if (!result.pcm.length) problems.push("sin audio");
            let ratio = 1;
            if (request.expected !== undefined) {
              ratio = wordMatchRatio(request.expected, result.transcript);
              if (ratio < MIN_WORD_MATCH) problems.push(`coincidencia ${(ratio * 100).toFixed(1)}%`);
              const missing = missingNumbers(request.expected, result.transcript);
              if (missing.length) problems.push(`faltan números: ${missing.join(", ")}`);
            } else if (job.kind === "arrival") {
              problems.push(...arrivalPhraseProblems(job.placeTitle, LISTEN_BUTTON_WORD[language], result.transcript));
            }

            if (options.trial) {
              const trimmed = trimSilence(result.pcm);
              console.log(`\nIntento ${attempt}, fragmento ${index + 1}:`);
              console.log(`  texto:          ${request.text}`);
              console.log(`  transcripción:  ${result.transcript}`);
              console.log(`  coincidencia:   ${(ratio * 100).toFixed(1)}%  ${problems.length ? `(${problems.join("; ")})` : "(ok)"}`);
              console.log(`  audio:          ${durationSeconds(result.pcm).toFixed(2)} s (${durationSeconds(trimmed).toFixed(2)} s sin los silencios de los bordes)`);
              console.log(`  uso:            ${JSON.stringify(result.usage)}`);
              console.log(`  costo real:     ${formatUsd(cost)}`);
            }

            if (problems.length) {
              lastProblem = `fragmento ${index + 1}, intento ${attempt}: ${problems.join("; ")} | dijo: "${result.transcript.slice(0, 160)}"`;
              continue;
            }
            worstMatch = Math.min(worstMatch, ratio);
            accepted = trimSilence(result.pcm);
          }
          if (!accepted) {
            failed = true;
            notes.push(`${label} (${language}): ${lastProblem}`);
            break;
          }
          pieces.push(accepted);
        }
      } catch (error) {
        if (!(error instanceof BudgetReached)) throw error;
        stopped = true;
        notes.push(`Se detuvo antes de pasar el tope (${formatUsd(options.budget)}); ${label} (${language}) y lo que sigue quedaron sin generar.`);
        continue;
      } finally {
        speaker.close();
      }

      const fragmentCount = requests.length;
      row.attempts = fragmentCount > 1 ? `${attempts} (${fragmentCount} fragm.)` : String(attempts);
      if (failed) {
        row.status = "revisar";
        continue;
      }
      row.match = `${(worstMatch * 100).toFixed(1)}%`;

      // Une los fragmentos con sus silencios y arma el alignment.
      const parts: Int16Array[] = [];
      const times: { start: number; end: number }[] = [];
      let cursor = 0;
      pieces.forEach((pcm, i) => {
        parts.push(pcm);
        times.push({ start: cursor, end: cursor + durationSeconds(pcm) });
        cursor += durationSeconds(pcm);
        const pause = job.kind === "narration" && i + 1 < pieces.length ? job.split.fragments[i].silenceAfter : 0;
        if (pause > 0) {
          parts.push(silence(pause));
          cursor += pause;
        }
      });
      const pcm = concatPcm(parts);
      const mp3 = await encodeMp3(pcm);
      const duration = durationSeconds(pcm);
      row.duration = `${duration.toFixed(1)} s`;
      row.status = "ok";

      const base = `${options.tourId}/${language}`;
      if (options.trial) {
        const name =
          options.trialFragments === undefined
            ? `${job.stepId}-fragmento-1.mp3`
            : `${job.stepId}-fragmentos-1-a-${options.trialFragments}.mp3`;
        const local = writeLocal(localDir, `${base}/prueba/${name}`, mp3);
        console.log(`\nCopia local: ${local}`);
        continue;
      }

      writeLocal(localDir, `${base}/${job.file}`, mp3);
      const alignmentFile = `${job.stepId}.json`;
      const alignment =
        job.kind === "narration"
          ? JSON.stringify(buildAlignment({ clean: job.split.clean, fragments: job.split.fragments }, times))
          : null;
      if (alignment) writeLocal(localDir, `${base}/${alignmentFile}`, alignment);
      // Comparando con otro modelo: solo la copia local.
      if (!storage) continue;

      await storage.upload(`${base}/${job.file}`, mp3, "audio/mpeg");
      const entry: Manifest["files"][string] = {
        hash: job.hash,
        durationSeconds: Math.round(duration * 1000) / 1000,
        generatedAt: new Date().toISOString(),
      };
      if (alignment) {
        await storage.upload(`${base}/${alignmentFile}`, alignment, "application/json");
        entry.alignment = alignmentFile;
      }
      manifest.model = model;
      manifest.voice = voice;
      manifest.files[job.file] = entry;
      // Después de cada archivo, para no perder lo hecho si algo se corta.
      await storage.writeManifest(manifest);
      writeLocal(localDir, `${base}/manifest.json`, JSON.stringify(manifest, null, 2));
    }
  }

  console.log("\n| Paso | Idioma | Duración | Intentos | Coincidencia | Costo | Marca |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    console.log(`| ${r.label} | ${r.language} | ${r.duration} | ${r.attempts} | ${r.match} | ${r.cost ? formatUsd(r.cost) : "-"} | ${r.status} |`);
  }
  if (notes.length) {
    console.log("\nPara revisar:");
    for (const note of notes) console.log(`- ${note}`);
  }
  console.log(`\nCosto real (según el uso que informó OpenAI): ${formatUsd(spent)}. Estimado era ${formatUsd(estimate)}.`);
  if (!options.trial) console.log(`Copia local: ${path.join(localDir, options.tourId)}`);
  if (!storage) console.log("No se subió nada a Supabase.");
}

main().catch((error: unknown) => {
  // Solo el mensaje: nunca encabezados ni configuración con llaves.
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
