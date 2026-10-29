import { Component } from "react";

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Admin page render failure:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="admin-error-boundary" role="alert">
        <h1>We couldn’t load this admin page</h1>
        <p>
          The page encountered an unexpected error. Your data was not changed.
        </p>
        <p className="admin-error-detail">{this.state.error.message || "Unknown application error."}</p>
        <button type="button" className="primary-button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </main>
    );
  }
}

export default AdminErrorBoundary;
