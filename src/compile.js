const path = require("path");
const { DLF, FTS, LLF } = require("arx-level-json-converter");
const { implode, stream, constants } = require("node-pkware");
const { COMPRESSION_BINARY, DICTIONARY_SIZE_LARGE } = constants;
const { through, transformSplitBy, splitAt, transformIdentity } = stream;
const fs = require("fs");
const { Transform } = require("stream");

// copied from arx-level-json-converter (should be exposed)
const outputInChunks = (buffer, stream) => {
  const chunks = Math.ceil(buffer.length / 1000);
  for (let i = 0; i < chunks - 1; i++) {
    stream.write(buffer.slice(i * 1000, (i + 1) * 1000));
  }
  stream.write(buffer.slice((chunks - 1) * 1000));
  stream.end();
};

const compileFTS = (config) => {
  return new Promise((resolve, reject) => {
    const { levelIdx, outputDir } = config;
    const src = path.resolve(
      outputDir,
      `./game/graph/levels/level${levelIdx}/fast.fts.json`
    );
    const dest = path.resolve(
      outputDir,
      `./game/graph/levels/level${levelIdx}/fast.fts`
    );
    const json = require(src);

    const offset = 280;

    let outputStream = new Transform();
    outputStream._transform = function (chunk, encoding, done) {
      this.push(chunk);
      done();
    };

    outputStream
      .pipe(
        through(
          transformSplitBy(
            splitAt(offset),
            transformIdentity(),
            implode(COMPRESSION_BINARY, DICTIONARY_SIZE_LARGE, { debug: true })
          )
        ).on("error", reject)
      )
      .pipe(fs.createWriteStream(dest).on("error", reject))
      .on("error", reject)
      .on("finish", resolve);

    outputInChunks(FTS.save(json), outputStream);
  });
};

const compileLLF = (config) => {
  return new Promise((resolve, reject) => {
    const { levelIdx, outputDir } = config;
    const src = path.resolve(
      outputDir,
      `./graph/levels/level${levelIdx}/level${levelIdx}.llf.json`
    );
    const dest = path.resolve(
      outputDir,
      `./graph/levels/level${levelIdx}/level${levelIdx}.llf`
    );
    const json = require(src);

    const offset = 0;

    let outputStream = new Transform();
    outputStream._transform = function (chunk, encoding, done) {
      this.push(chunk);
      done();
    };

    outputStream
      .pipe(
        through(
          transformSplitBy(
            splitAt(offset),
            transformIdentity(),
            implode(COMPRESSION_BINARY, DICTIONARY_SIZE_LARGE, { debug: true })
          )
        ).on("error", reject)
      )
      .pipe(fs.createWriteStream(dest).on("error", reject))
      .on("error", reject)
      .on("finish", resolve);

    outputInChunks(LLF.save(json), outputStream);
  });
};

const compileDLF = (config) => {
  return new Promise((resolve, reject) => {
    const { levelIdx, outputDir } = config;
    const src = path.resolve(
      outputDir,
      `./graph/levels/level${levelIdx}/level${levelIdx}.dlf.json`
    );
    const dest = path.resolve(
      outputDir,
      `./graph/levels/level${levelIdx}/level${levelIdx}.dlf`
    );
    const json = require(src);

    const offset = 8520;

    let outputStream = new Transform();
    outputStream._transform = function (chunk, encoding, done) {
      this.push(chunk);
      done();
    };

    outputStream
      .pipe(
        through(
          transformSplitBy(
            splitAt(offset),
            transformIdentity(),
            implode(COMPRESSION_BINARY, DICTIONARY_SIZE_LARGE, { debug: true })
          )
        ).on("error", reject)
      )
      .pipe(fs.createWriteStream(dest).on("error", reject))
      .on("error", reject)
      .on("finish", resolve);

    outputInChunks(DLF.save(json), outputStream);
  });
};

module.exports = {
  compileFTS,
  compileLLF,
  compileDLF,
};
