/// <reference types="vite/client" />

import type { ElectronApi } from "../shared/contracts/ipc";

declare global {
  interface Window {
    api: ElectronApi;
  }
}

export {};