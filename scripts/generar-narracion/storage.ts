// Supabase Storage: bucket PRIVADO "narrations" (sin acceso público; el
// servidor entrega URLs firmadas de 1 hora). Rutas dentro del bucket:
//   <tourId>/<idioma>/<stepId>.mp3 y .json (alignment)
//   <tourId>/<idioma>/arrival/<stepId>.mp3 (pregunta "¿Llegaste?")
//   <tourId>/<idioma>/manifest.json

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const NARRATIONS_BUCKET = "narrations";

export type ManifestEntry = {
  // Hash del texto (y de la voz, el modelo y las instrucciones) que lo generó.
  hash: string;
  durationSeconds: number;
  generatedAt: string;
  // Archivo con el alignment (solo la narración de los pasos).
  alignment?: string;
};

export type Manifest = {
  tourId: string;
  language: string;
  model: string;
  voice: string;
  // Por archivo: "<stepId>.mp3" o "arrival/<stepId>.mp3".
  files: Record<string, ManifestEntry>;
};

export function createStorage(url: string, secretKey: string) {
  const client: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bucket = () => client.storage.from(NARRATIONS_BUCKET);

  return {
    // Crea el bucket privado si no existe; si existe y es público, lo pasa a
    // privado.
    async ensurePrivateBucket(): Promise<"creado" | "ya existía" | "pasado a privado"> {
      const { data, error } = await client.storage.getBucket(NARRATIONS_BUCKET);
      if (!error && data) {
        if (!data.public) return "ya existía";
        const { error: updateError } = await client.storage.updateBucket(NARRATIONS_BUCKET, { public: false });
        if (updateError) throw new Error(`No se pudo pasar el bucket a privado: ${updateError.message}`);
        return "pasado a privado";
      }
      const { error: createError } = await client.storage.createBucket(NARRATIONS_BUCKET, { public: false });
      if (createError) throw new Error(`No se pudo crear el bucket: ${createError.message}`);
      return "creado";
    },

    async readManifest(tourId: string, language: string): Promise<Manifest | null> {
      const { data, error } = await bucket().download(`${tourId}/${language}/manifest.json`);
      if (error || !data) return null;
      return JSON.parse(await data.text()) as Manifest;
    },

    async upload(path: string, body: Buffer | string, contentType: string) {
      const { error } = await bucket().upload(path, body, { contentType, upsert: true, cacheControl: "60" });
      if (error) throw new Error(`No se pudo subir ${path}: ${error.message}`);
    },

    async writeManifest(manifest: Manifest) {
      await this.upload(
        `${manifest.tourId}/${manifest.language}/manifest.json`,
        JSON.stringify(manifest, null, 2),
        "application/json"
      );
    },

    async remove(paths: string[]) {
      const { error } = await bucket().remove(paths);
      if (error) throw new Error(`No se pudo borrar: ${error.message}`);
    },
  };
}

export type Storage = ReturnType<typeof createStorage>;
