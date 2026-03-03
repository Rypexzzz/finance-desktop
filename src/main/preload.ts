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
  },
  goals: {
    list: (params) => ipcRenderer.invoke("goals:list", params),
    create: (payload) => ipcRenderer.invoke("goals:create", payload),
    update: (id, payload) => ipcRenderer.invoke("goals:update", { id, payload }),
    changeStatus: (id, status) => ipcRenderer.invoke("goals:changeStatus", { id, status }),
    contributions: (goalId) => ipcRenderer.invoke("goals:contributions", { goalId }),
    addContribution: (goalId, payload) => ipcRenderer.invoke("goals:addContribution", { goalId, payload })
  },
  debts: {
    list: (params) => ipcRenderer.invoke("debts:list", params),
    create: (payload) => ipcRenderer.invoke("debts:create", payload),
    update: (id, payload) => ipcRenderer.invoke("debts:update", { id, payload }),
    changeStatus: (id, status) => ipcRenderer.invoke("debts:changeStatus", { id, status }),
    delete: (id) => ipcRenderer.invoke("debts:delete", { id }),
    payments: (debtId) => ipcRenderer.invoke("debts:payments", { debtId }),
    addPayment: (debtId, payload) => ipcRenderer.invoke("debts:addPayment", { debtId, payload })
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    setTheme: (theme) => ipcRenderer.invoke("settings:setTheme", { theme })
  }
};

contextBridge.exposeInMainWorld("api", api);
