import { Component, type ErrorInfo, type ReactNode } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the error for debugging without crashing to a blank screen.
    console.error("Unhandled rendering error:", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background p-lg text-on-surface">
        <div className="glass-level-2 flex w-full max-w-[28rem] flex-col items-center gap-md rounded-xl border border-error/30 p-xl text-center">

          <MaterialIcon name="error" filled size={44} className="text-error" />
          <h1 className="text-headline-lg-mobile text-on-surface">Something went wrong</h1>
          <p className="text-body-sm text-on-surface-variant">
            The application hit an unexpected error. You can recover without losing your session list.
          </p>
          {this.state.error?.message && (
            <code className="w-full break-all rounded bg-surface-container p-sm text-mono-code text-error">
              {this.state.error.message}
            </code>
          )}
          <div className="mt-sm flex gap-sm">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-full bg-primary px-lg py-sm text-on-primary text-body-sm font-semibold transition-transform active:scale-95"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-full border border-white/10 px-lg py-sm text-on-surface-variant text-body-sm transition-colors hover:bg-white/5"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
