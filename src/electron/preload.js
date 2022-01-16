const path = require("path");
const seedrandom = require("seedrandom");
const { cleanupCache } = require("../helpers.js");
const aliasNightmare = require("../projects/alias-nightmare/index.js");
const theBackrooms = require("../projects/backrooms/index.js");
const { compileFTS, compileLLF, compileDLF } = require("../compile.js");
const { ipcRenderer } = require("electron");

const generateSeed = () => Math.floor(Math.random() * 1e20);

// let seed = generateSeed()
let seed = 70448428008674860000;
let project = "backrooms";
let outputDir = path.resolve("./dist");

window.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");

  document
    .querySelector(`[name="project"][value="${project}"]`)
    .setAttribute("checked", "checked");

  const projects = document.querySelectorAll('[name="project"]');
  projects.forEach((option) => {
    option.addEventListener("input", () => {
      project = option.value;
      projects.forEach((option) => {
        if (option === project) {
          option.setAttribute("checked", "checked");
        } else {
          option.removeAttribute("checked");
        }
      });
      pages.forEach((page) => {
        if (page.getAttribute("data-project") === project) {
          page.classList.remove("hidden");
        } else {
          page.classList.add("hidden");
        }
      });
    });
  });

  pages.forEach((page) => {
    if (page.getAttribute("data-project") === project) {
      page.classList.remove("hidden");
    } else {
      page.classList.add("hidden");
    }
  });

  const seedInputs = document.querySelectorAll('[name="seed"]');
  seedInputs.forEach((seedInput) => {
    seedInput.value = seed;
    seedInput.addEventListener("input", () => {
      seed = seedInput.value;
    });
  });

  const randomizeSeedBtns = document.querySelectorAll(".randomize-seed");
  randomizeSeedBtns.forEach((randomizeSeedBtn) => {
    randomizeSeedBtn.addEventListener("click", () => {
      seed = generateSeed();
      seedInputs.forEach((seedInput) => {
        seedInput.value = seed;
      });
    });
  });

  const loading = {
    wrapper: document.getElementById("loading"),
    text: document.querySelector("#loading p"),
    btn: document.querySelector("#loading button"),
    progressbar: document.querySelector("#loading .progressbar"),
  };

  const generateBtns = document.querySelectorAll(".generate");
  generateBtns.forEach((generateBtn) => {
    generateBtn.addEventListener("click", () => {
      generateBtn.disabled = true;

      loading.btn.classList.add("hidden");
      loading.text.textContent = "(1/4) Generating level data";
      loading.progressbar.className = "progressbar percent0";
      loading.wrapper.classList.remove("hidden");

      setTimeout(async () => {
        seedrandom(seed, { global: true });

        const config = {
          origin: [6000, 0, 6000],
          levelIdx: 1,
          seed,
          outputDir,
        };

        switch (project) {
          case "backrooms":
            await theBackrooms({
              ...config,
              numberOfRooms: 50,
              roomDimensions: { width: [1, 5], depth: [1, 5], height: 2 },
            });
            break;
          case "alias-nightmare":
            await aliasNightmare({
              ...config,
            });
            break;
        }

        loading.progressbar.className = "progressbar percent25";
        loading.text.textContent = "(2/4) Compiling level mesh";

        setTimeout(async () => {
          await compileFTS(config);

          loading.progressbar.className = "progressbar percent50";
          loading.text.textContent = "(3/4) Compiling lighting information";

          setTimeout(async () => {
            await compileLLF(config);

            loading.progressbar.className = "progressbar percent75";
            loading.text.textContent = "(4/4) Compiling entities and paths";

            setTimeout(async () => {
              await compileDLF(config);

              cleanupCache();

              loading.progressbar.className = "progressbar percent100";
              loading.text.textContent = "Done!";
              loading.btn.classList.remove("hidden");
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    });
  });

  loading.btn.addEventListener("click", () => {
    generateBtns.forEach((generateBtn) => {
      generateBtn.disabled = false;
    });
    loading.wrapper.classList.add("hidden");
  });

  // --------------

  const outputDirInputs = document.querySelectorAll(
    '[name="output-directory"]'
  );
  outputDirInputs.forEach((outputDirInput) => {
    outputDirInput.value = outputDir;
  });

  const selectDirBtns = document.querySelectorAll(".select-output-directory");
  selectDirBtns.forEach((selectDirBtn) => {
    selectDirBtn.addEventListener("click", () => {
      ipcRenderer.send("change output directory");
    });
  });

  ipcRenderer.on("output directory changed", (e, folder) => {
    outputDir = folder;
    outputDirInputs.forEach((outputDirInput) => {
      outputDirInput.value = outputDir;
    });
  });
});
