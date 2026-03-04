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
    getById: (id, params) => ipcRenderer.invoke("goals:getById", { id, ...params }),
    getProgress: (id, params) => ipcRenderer.invoke("goals:getProgress", { id, ...params }),
    contributions: (goalId) => ipcRenderer.invoke("goals:contributions", { goalId }),
    getContributions: (goalId, params) => ipcRenderer.invoke("goals:getContributions", { goalId, ...params }),
    addContribution: (goalId, payload) => ipcRenderer.invoke("goals:addContribution", { goalId, payload })
  },
  debts: {
    list: (params) => ipcRenderer.invoke("debts:list", params),
    create: (payload) => ipcRenderer.invoke("debts:create", payload),
    update: (id, payload) => ipcRenderer.invoke("debts:update", { id, payload }),
    changeStatus: (id, status) => ipcRenderer.invoke("debts:changeStatus", { id, status }),
    getById: (id, params) => ipcRenderer.invoke("debts:getById", { id, ...params }),
    getProgress: (id, params) => ipcRenderer.invoke("debts:getProgress", { id, ...params }),
    delete: (id) => ipcRenderer.invoke("debts:delete", { id }),
    payments: (debtId) => ipcRenderer.invoke("debts:payments", { debtId }),
    getPayments: (debtId, params) => ipcRenderer.invoke("debts:getPayments", { debtId, ...params }),
    addPayment: (debtId, payload) => ipcRenderer.invoke("debts:addPayment", { debtId, payload })
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    setTheme: (theme) => ipcRenderer.invoke("settings:setTheme", { theme })
  },
  dashboard: {
    getSummary: (params) => ipcRenderer.invoke("dashboard:getSummary", params)
  },
  analytics: {
    getMonthOverview: (params) => ipcRenderer.invoke("analytics:getMonthOverview", params),
    getYearOverview: (params) => ipcRenderer.invoke("analytics:getYearOverview", params),
    getCategoryBreakdown: (params) => ipcRenderer.invoke("analytics:getCategoryBreakdown", params),
    getMonthlyTrend: (params) => ipcRenderer.invoke("analytics:getMonthlyTrend", params),
    getMonthComparison: (params) => ipcRenderer.invoke("analytics:getMonthComparison", params)
  }
};

contextBridge.exposeInMainWorld("api", api);
