const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  ipcRenderer,
} = require("electron");
const path = require("path");

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "electron/preload.js"),
    },
  });

  // win.setMenu(null);

  win.loadFile(path.join(__dirname, "electron/index.html"));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("change output directory", async (e) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
  });

  if (!canceled) {
    e.sender.send("output directory changed", filePaths[0]);
  }
});
