import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-wrap" style={{ color: "var(--text)" }}>
          <div className="auth-card system-window">
            <h2>Something went wrong</h2>
            <p>Please refresh the page or try again later.</p>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
