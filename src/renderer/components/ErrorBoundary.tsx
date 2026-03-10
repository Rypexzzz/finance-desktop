import { Component } from "react";
import type { ErrorInfo, PropsWithChildren } from "react";

type State = { error: Error | null };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: "var(--text, #f3f4f6)", background: "var(--bg, #0b1220)", minHeight: "100vh" }}>
          <h2>Что-то пошло не так</h2>
          <p style={{ color: "var(--muted, #9ca3af)" }}>Приложение столкнулось с ошибкой. Попробуйте перезагрузить.</p>
          <pre style={{ marginTop: 16, padding: 16, background: "var(--surface, #111827)", borderRadius: 8, overflow: "auto", fontSize: 13 }}>
            {this.state.error.message}
          </pre>
          <button
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
