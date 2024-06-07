import Bun from "bun";

await Bun.build({
  entrypoints: ["./src/exports/index.ts", "./src/exports/react-components.ts"],
  outdir: "./dist",
  target: "browser",
  sourcemap: "external",
  external: ["react", "react-dom"]
}).then(() => {
  console.log("Build complete");
}).catch((err) => {
  console.error("Build failed", err);
});