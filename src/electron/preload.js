const seedrandom = require("seedrandom");

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
      seedInput.value = seed;
    });
  });

  const generateBtns = document.querySelectorAll(".generate");
  generateBtns.forEach((generateBtn) => {
    generateBtn.addEventListener("click", () => {
      seedrandom(seed, { global: true });
      alert(`generating ${project} with seed ${seed}`);
    });
  });
});
