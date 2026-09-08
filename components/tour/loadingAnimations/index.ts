import { ComponentType } from "react";
import WaveTravelerAnimation from "./WaveTravelerAnimation";

// Biblioteca de animaciones para la pantalla de carga del tour
// (TourLoadingScreen). Cada una es un componente auto-contenido, sin
// props, que maneja su propio loop internamente — TourLoadingScreen elige
// una al azar de este array una sola vez por montaje.
//
// Para agregar una animación nueva: crear su archivo acá adentro con la
// misma forma (sin props, se anima sola), importarlo arriba, y sumarlo a
// este array. Es el único lugar que hace falta tocar — no hay que
// modificar TourLoadingScreen.tsx.
export const LOADING_ANIMATIONS: ComponentType[] = [WaveTravelerAnimation];
