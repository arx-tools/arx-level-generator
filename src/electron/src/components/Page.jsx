import React from "react";
import cn from "classnames";
import Badge from "./Badge.jsx";

const Page = ({
  title,
  background,
  isVisible,
  outputDir,
  onOutputDirChange,
  onBrowseBtnClick,
  seed,
  onSeedChange,
  onRandomizeBtnClick,
  onGenerateBtnClick,
  isInstalled,
  children,
}) => {
  return (
    <section
      className={cn("page", { hidden: !isVisible })}
      style={{
        background: `url('${background}') no-repeat center center`,
      }}
    >
      <h1>
        <span>{title}</span>
        {isInstalled && <Badge>installed</Badge>}
      </h1>

      <div>
        <div className="field">
          <label>Output directory</label>
          <input
            type="text"
            value={outputDir}
            onInput={onOutputDirChange}
            placeholder=""
          />
          <button onClick={onBrowseBtnClick}>browse</button>
        </div>

        <div className="field">
          <label>Seed</label>
          <input
            type="text"
            onInput={onSeedChange}
            value={seed}
            placeholder="seed"
          />
          <button onClick={onRandomizeBtnClick}>randomize</button>
        </div>

        {children}
      </div>

      <footer>
        <button
          className="generate"
          onClick={() => {
            onGenerateBtnClick({});
          }}
        >
          Generate
        </button>
      </footer>
    </section>
  );
};

export default Page;
