import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-offwhite flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-charcoal mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Something went wrong
            </h1>
            <p className="text-sm text-muted mb-4">The app hit an unexpected error.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="btn-primary"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
