import React, { useState, useEffect } from "react";
import AliasNightmare from "../projects/AliasNightmare.jsx";
import TheBackrooms from "../projects/TheBackrooms.jsx";
import Loading from "./Loading.jsx";
import MenuItem from "./MenuItem.jsx";
import path from "path";
import seedrandom from "seedrandom";
import { ipcRenderer } from "electron";
import { cleanupCache } from "../../../helpers.js";
import aliasNightmare from "../../../projects/alias-nightmare/index.js";
import theBackrooms from "../../../projects/backrooms/index.js";
import { compileFTS, compileLLF, compileDLF } from "../../../compile.js";

const projects = [
  {
    label: "Alia's Nightmare",
    value: "alias-nightmare",
    Page: AliasNightmare,
  },
  { label: "The Backrooms", value: "the-backrooms", Page: TheBackrooms },
];

const generateSeed = () => Math.floor(Math.random() * 1e20);

const App = () => {
  const [seed, setSeed] = useState("70448428008674860000"); //generateSeed()
  const [project, setProject] = useState(projects[1].value);
  const [outputDir, setOutputDir] = useState(path.resolve("./dist"));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [loadingProgressbarPercent, setLoadingProgressbarPercent] = useState(0);
  const [isLoadingDoneBtnVisible, setIsLoadingDoneBtnVisible] = useState(false);

  useEffect(() => {
    ipcRenderer.on("output directory changed", (e, folder) => {
      setOutputDir(folder);
    });
  }, []);

  return (
    <>
      <aside>
        <ul>
          {projects.map(({ label, value }) => (
            <li key={value}>
              <MenuItem
                isSelected={project === value}
                onClick={() => setProject(value)}
                label={label}
              />
            </li>
          ))}
        </ul>
      </aside>
      <main>
        {projects.map(({ value, Page }) => (
          <Page
            key={value}
            isVisible={project === value}
            outputDir={outputDir}
            onOutputDirChange={(e) => setOutputDir(e.target.value)}
            onBrowseBtnClick={() => {
              ipcRenderer.send("change output directory");
            }}
            seed={seed}
            onSeedChange={(e) => setSeed(e.target.value)}
            onRandomizeBtnClick={() => {
              if (isLoading) {
                return;
              }

              setSeed(generateSeed());
            }}
            onGenerateBtnClick={(settings) => {
              if (isLoading) {
                return;
              }

              setIsLoading(true);
              setLoadingText("(1/4) Generating level data");
              setLoadingProgressbarPercent(0);
              setIsLoadingDoneBtnVisible(false);

              setTimeout(async () => {
                seedrandom(seed, { global: true });

                const config = {
                  origin: [6000, 0, 6000],
                  levelIdx: 1,
                  seed,
                  outputDir,
                  ...settings,
                };

                switch (project) {
                  case "the-backrooms":
                    await theBackrooms({
                      ...config,
                      roomDimensions: {
                        width: [1, 5],
                        depth: [1, 5],
                        height: 2,
                      },
                    });
                    break;
                  case "alias-nightmare":
                    await aliasNightmare({
                      ...config,
                    });
                    break;
                }

                setLoadingText("(2/4) Compiling level mesh");
                setLoadingProgressbarPercent(25);

                setTimeout(async () => {
                  await compileFTS(config);

                  setLoadingText("(3/4) Compiling lighting information");
                  setLoadingProgressbarPercent(50);

                  setTimeout(async () => {
                    await compileLLF(config);

                    setLoadingText("(4/4) Compiling entities and paths");
                    setLoadingProgressbarPercent(75);

                    setTimeout(async () => {
                      await compileDLF(config);

                      cleanupCache();

                      setLoadingProgressbarPercent(100);
                      setLoadingText("Done!");
                      setIsLoadingDoneBtnVisible(true);
                    }, 100);
                  }, 100);
                }, 100);
              }, 100);
            }}
          />
        ))}
      </main>
      <Loading
        isVisible={isLoading}
        message={loadingText}
        progressbarPercent={loadingProgressbarPercent}
        showDoneBtn={isLoadingDoneBtnVisible}
        onDoneClick={() => {
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default App;
