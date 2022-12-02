#!/bin/bash

# creates tsconfig.tsbuildinfo -> needed for esbuild in the next step
tsc --project ./tsconfig.json

esbuild ./src/index.ts\
  --bundle\
  --platform=node\
  --minify\
  --outdir=build\
  --sourcemap\
  --external:arx-level-json-converter\
  --external:color-rgba\
  --external:node-pkware\
  --external:seedrandom\
  --external:tiny-glob

node --require dotenv/config --enable-source-maps ./build/index.js
