import { contextBridge, ipcRenderer } from "electron";
import type { ElectronApi } from "../shared/contracts/ipc";

const api: ElectronApi = {
  categories: {
    list: (params) => ipcRenderer.invoke("categories:list", params)
  },
  transactions: {
    list: (filters) => ipcRenderer.invoke("transactions:list", filters),
    create: (payload) => ipcRenderer.invoke("transactions:create", payload),
    update: (id, payload) => ipcRenderer.invoke("transactions:update", { id, payload }),
    delete: (id) => ipcRenderer.invoke("transactions:delete", { id })
  }
};

contextBridge.exposeInMainWorld("api", api);