const { options } = require("nodemon/lib/config");
const seedrandom = require("seedrandom");

const generateSeed = () => Math.floor(Math.random() * 1e20);

// let seed = generateSeed()
let seed = 70448428008674860000;
let project = "backrooms";

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(`[name="project"][value="${project}"]`)
    .setAttribute("checked", "checked");
  const projects = document.querySelectorAll('[name="project"]');
  projects.forEach((option) => {
    option.addEventListener("input", () => {
      project = option.value;
      options.forEach((option) => {
        if (option === project) {
          option.setAttribute("checked", "checked");
        } else {
          option.removeAttribute("checked");
        }
      });
    });
  });

  const generateBtn = document.getElementById("generate");
  generateBtn.addEventListener("click", () => {
    seedrandom(seed, { global: true });
    alert(`generating ${project} with seed ${seed}`);
  });

  const seedInput = document.querySelector('[name="seed"]');
  seedInput.value = seed;
  seedInput.addEventListener("input", () => {
    seed = seedInput.value;
  });

  const randomizeSeedBtn = document.getElementById("randomize-seed");
  randomizeSeedBtn.addEventListener("click", () => {
    seed = generateSeed();
    seedInput.value = seed;
  });
});
