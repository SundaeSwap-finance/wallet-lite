import { createRoot } from "react-dom/client";
import "./styles.css";

import { Root } from "./App";

const target = document.querySelector("#app");
if (target) {
  const root = createRoot(target);
  root.render(<Root />);
}
