import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { TimeOfDay } from "../../lib/timeOfDay";
import { TOUR_GRADIENT_COLORS } from "../../lib/tourTheme";

// Lienzo base 390x844 (iPhone). "xMidYMax slice" lo escala para cubrir
// cualquier pantalla; el rect de fondo desborda el lienzo para que no
// queden bordes en pantallas más altas o más anchas.
const NIGHT_VEIL_COLOR = "#241A66";
const NIGHT_VEIL_OPACITY = 0.2;

const STARS: ReadonlyArray<readonly [number, number, number]> = [
  [30, 90, 1.6], [70, 150, 1.2], [60, 230, 1.3], [20, 300, 1.1],
  [150, 190, 1.2], [240, 160, 1.1], [360, 110, 1.4], [350, 250, 1.4],
  [130, 240, 1.1], [310, 210, 1.1], [90, 330, 1.0], [370, 320, 1.2],
  [250, 250, 1.0], [210, 300, 1.1],
];

export function HomeScene({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 844"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Defs>
        {/* Mismo degradado y misma diagonal que el resto de la app */}
        <LinearGradient
          id="bg"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="390"
          y2="844"
        >
          <Stop offset="0" stopColor={TOUR_GRADIENT_COLORS[0]} />
          <Stop offset="0.5" stopColor={TOUR_GRADIENT_COLORS[1]} />
          <Stop offset="1" stopColor={TOUR_GRADIENT_COLORS[2]} />
        </LinearGradient>
        <RadialGradient id="sunMorning" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFF3C8" stopOpacity="0.95" />
          <Stop offset="0.3" stopColor="#FFE9A8" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="sunAfternoon" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFE8C4" stopOpacity="0.95" />
          <Stop offset="0.3" stopColor="#FFC08A" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FF9F7A" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient
          id="glowAfternoon"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="480"
          x2="0"
          y2="844"
        >
          <Stop offset="0" stopColor="#FFB38A" stopOpacity="0" />
          <Stop offset="1" stopColor="#FFA98A" stopOpacity="0.55" />
        </LinearGradient>
        <RadialGradient id="cloud" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFF6DA" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#FFF6DA" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="-400" y="-800" width="1190" height="1700" fill="url(#bg)" />

      {timeOfDay === "morning" && (
        <G>
          <Circle cx={300} cy={110} r={260} fill="url(#sunMorning)" />
          <Circle cx={300} cy={110} r={46} fill="#FFF6D8" opacity={0.95} />
          <Ellipse cx={90} cy={190} rx={80} ry={22} fill="url(#cloud)" />
          <Ellipse cx={320} cy={300} rx={70} ry={18} fill="url(#cloud)" />
          <Ellipse cx={70} cy={650} rx={80} ry={20} fill="url(#cloud)" />
        </G>
      )}

      {timeOfDay === "afternoon" && (
        <G>
          <Rect
            x="-400"
            y="480"
            width="1190"
            height="400"
            fill="url(#glowAfternoon)"
          />
          <Circle cx={330} cy={640} r={260} fill="url(#sunAfternoon)" />
          <Circle cx={330} cy={640} r={44} fill="#FFE6C0" opacity={0.9} />
          <Ellipse cx={80} cy={200} rx={80} ry={20} fill="url(#cloud)" />
          <Ellipse cx={310} cy={330} rx={70} ry={17} fill="url(#cloud)" />
        </G>
      )}

      {timeOfDay === "night" && (
        <G>
          <Rect
            x="-400"
            y="-800"
            width="1190"
            height="1700"
            fill={NIGHT_VEIL_COLOR}
            opacity={NIGHT_VEIL_OPACITY}
          />
          {STARS.map(([x, y, r], i) => (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={r + 0.4}
              fill="#FFFFFF"
              opacity={0.6 + (i % 4) * 0.1}
            />
          ))}
          <Circle cx={320} cy={150} r={80} fill="url(#moonGlow)" />
          <Circle cx={320} cy={150} r={32} fill="#FFF6DA" />
          <Circle cx={308} cy={140} r={5} fill="#EFE3C0" />
          <Circle cx={331} cy={160} r={7} fill="#EFE3C0" opacity={0.8} />
        </G>
      )}
    </Svg>
  );
}
