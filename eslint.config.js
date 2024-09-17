import { configs } from "@sundaeswap/eslint-config";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...configs,
  {
    rules: {
      "no-console": "off",
    },
    languageOptions: {
      globals: {
        JSX: true,
        EventListenerOptions: true,
        EventListenerOrEventListenerObject: true,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
