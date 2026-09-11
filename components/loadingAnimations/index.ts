import { ComponentType } from "react";
import CircleOrbitAnimation from "./CircleOrbitAnimation";
import EllipticalOrbitAnimation from "./EllipticalOrbitAnimation";
import SpiralPathAnimation from "./SpiralPathAnimation";
import StepPathAnimation from "./StepPathAnimation";
import WaveTravelerAnimation from "./WaveTravelerAnimation";
import ZigzagPathAnimation from "./ZigzagPathAnimation";

// Biblioteca de animaciones para las pantallas de carga (TourLoadingScreen
// y LoadingSearchScreen). Cada una es un componente auto-contenido, sin
// props, que maneja su propio loop internamente — cada pantalla elige una
// al azar de este array una sola vez por montaje.
//
// Para agregar una animación nueva: crear su archivo acá adentro con la
// misma forma (sin props, se anima sola), importarlo arriba, y sumarlo a
// este array. Es el único lugar que hace falta tocar — no hay que
// modificar ninguna de las dos pantallas.
export const LOADING_ANIMATIONS: ComponentType[] = [
  WaveTravelerAnimation,
  CircleOrbitAnimation,
  StepPathAnimation,
  ZigzagPathAnimation,
  SpiralPathAnimation,
  EllipticalOrbitAnimation,
];
