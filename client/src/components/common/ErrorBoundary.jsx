import React from 'react';

/**
 * Phase 23: catch render errors so one broken page doesn't white-screen the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, info?.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            The page hit an unexpected error. You can go home and try again.
          </p>
          <button type="button" className="btn-primary" onClick={this.handleReload}>
            Go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
