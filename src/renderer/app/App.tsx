import { useEffect } from "react";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import type { AppTheme } from "../../shared/types/settings";

function resolveTheme(theme: AppTheme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function App() {
  useEffect(() => {
    window.api.settings
      .get()
      .then((res) => {
        if (!res.ok) return;
        document.documentElement.dataset.theme = resolveTheme(res.data.theme);
      })
      .catch(() => {
        document.documentElement.dataset.theme = "dark";
      });
  }, []);

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
