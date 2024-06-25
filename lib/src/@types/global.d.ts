import { TWindowCardano } from "./observer.js";

declare global {
  interface Window {
    cardano?: TWindowCardano;
  }
}
