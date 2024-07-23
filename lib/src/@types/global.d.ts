import { TWindowCardano } from "./observer.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    cardano?: TWindowCardano;
  }
}
