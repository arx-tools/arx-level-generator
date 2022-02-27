import React, { useState } from "react";
import Page from "../components/Page.jsx";

const TheLake = ({ onGenerateBtnClick, ...props }) => {
  return (
    <Page
      title="The Lake"
      background="previews/the-lake.png"
      onGenerateBtnClick={onGenerateBtnClick}
      {...props}
    />
  );
};

export default TheLake;
