const util = require("util");
const exec = util.promisify(require("child_process").exec);
const seedrandom = require("seedrandom");
const { cleanupCache } = require("../helpers.js");
const aliasNightmare = require("../projects/alias-nightmare/index.js");
const theBackrooms = require("../projects/backrooms/index.js");

const generateSeed = () => Math.floor(Math.random() * 1e20);

// let seed = generateSeed()
let seed = 70448428008674860000;
let project = "backrooms";

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

      loading.text.textContent = "";
      loading.btn.classList.add("hidden");
      loading.progressbar.className = "progressbar percent0";
      loading.wrapper.classList.remove("hidden");

      setTimeout(() => {
        loading.progressbar.className = "progressbar percent33";
        loading.text.textContent = "(1/2) Generating level data...";

        seedrandom(seed, { global: true });

        const config = {
          origin: [6000, 0, 6000],
          levelIdx: 1,
          seed,
        };

        setTimeout(async () => {
          switch (project) {
            case "backrooms":
              await theBackrooms({
                ...config,
              });
              break;
            case "alias-nightmare":
              await aliasNightmare({
                ...config,
              });
              break;
          }

          loading.progressbar.className = "progressbar percent66";
          loading.text.textContent = "(2/2) Compressing level data...";

          setTimeout(async () => {
            const { stderr } = await exec(`sh scripts/compile.sh`);

            if (stderr) {
              console.error(stderr);
            }

            cleanupCache();

            loading.progressbar.className = "progressbar percent100";
            loading.text.textContent = "Done!";
            loading.btn.classList.remove("hidden");
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
});
