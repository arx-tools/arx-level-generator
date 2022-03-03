import React, { useState } from "react";
import Page from "../components/Page.jsx";

const OnTheIsland = ({ onGenerateBtnClick, ...props }) => {
  return (
    <Page
      title="On the island"
      background="previews/on-the-island.png"
      onGenerateBtnClick={onGenerateBtnClick}
      {...props}
    />
  );
};

export default OnTheIsland;
