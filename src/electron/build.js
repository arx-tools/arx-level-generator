const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const path = require("path");
const fs = require("fs");

const OUTPUT = path.resolve(__dirname, "./build");

const initOutputFolder = async () => {
  try {
    await fs.promises.rm(OUTPUT, { recursive: true });
  } catch (e) {}

  return fs.promises.mkdir(OUTPUT, { recursive: true });
};

const buildJsAndCss = async () => {
  return build({
    entryPoints: [path.resolve(__dirname, "./src/app.jsx")],
    outdir: OUTPUT,
    minify: true,
    bundle: true,
    sourcemap: true,
    format: "cjs",
    target: "node16",
    platform: "node",
    external: [
      "electron",
      "arx-level-json-converter",
      "color-rgba",
      "nanoid",
      "node-pkware",
      "ramda",
      "ramda-adjunct",
      "seedrandom",
      "*.png",
    ],
    plugins: [sassPlugin()],
  });
};

(async () => {
  await initOutputFolder();
  await buildJsAndCss();
})();
