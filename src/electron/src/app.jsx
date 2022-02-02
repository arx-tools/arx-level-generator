import path from "path";
import React from "react";
import ReactDOM from "react-dom";
import { setRootPath } from "../../../rootpath.js";
import App from "./components/App.jsx";

setRootPath(path.resolve(__dirname, "../../../"));

window.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById("app"));
});
