import React from 'react';

class ConsignorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    console.error('Ìªë ConsignorErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Ì∫® COMPONENT ERROR CAUGHT BY BOUNDARY:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timeSinceNavigation: (Date.now() - performance.timing.navigationStart) / 1000
    });

    // Check if this error occurred soon after navigation
    const timeSincePageLoad = Date.now() - performance.timing.navigationStart;
    if (timeSincePageLoad < 10000) {
      console.warn('‚ö†Ô∏è ERROR OCCURRED DURING NAVIGATION - This could trigger logout');
      console.warn('   Time since navigation:', timeSincePageLoad, 'ms');
      console.warn('   Error message:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">‚ö†Ô∏è</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              A component error occurred while loading the consignor details page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ConsignorErrorBoundary;
