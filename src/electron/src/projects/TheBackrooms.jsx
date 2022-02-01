import React, { useState } from "react";
import Page from "../components/Page.jsx";

const TheBackrooms = ({ onGenerateBtnClick, ...props }) => {
  const [numberOfRooms, setNumberOfRooms] = useState(50);

  return (
    <Page
      title="The Backrooms"
      background="previews/the-backrooms.png"
      onGenerateBtnClick={(config) => {
        onGenerateBtnClick({ numberOfRooms, ...config });
      }}
      {...props}
    >
      <div className="field">
        <label>Number of rooms</label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={numberOfRooms}
          onInput={(e) => {
            const newValue = parseInt(e.target.value);
            if (!isNaN(newValue) && newValue >= 0) {
              setNumberOfRooms(newValue);
            }
          }}
          placeholder=""
        />
      </div>
    </Page>
  );
};

export default TheBackrooms;
