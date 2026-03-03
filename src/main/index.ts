import path from "node:path";
import { app, BrowserWindow, Menu } from "electron";
import { initDb } from "./db/client";
import { runMigrations } from "./db/migrations";
import { registerIpcHandlers } from "./ipc";
import { getDbFilePath, getMigrationsDir } from "./utils/paths";

let mainWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    title: "Finance Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

async function bootstrap() {
  await app.whenReady();
  Menu.setApplicationMenu(null);

  const db = initDb(getDbFilePath());
  runMigrations(db, getMigrationsDir());

  registerIpcHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  app.quit();
});