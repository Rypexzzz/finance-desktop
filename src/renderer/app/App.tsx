import { useEffect } from "react";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  useEffect(() => {
    window.api.settings
      .get()
      .then((res) => {
        if (!res.ok) return;
        document.documentElement.dataset.theme = res.data.theme;
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
