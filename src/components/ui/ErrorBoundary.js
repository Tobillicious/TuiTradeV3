// =============================================
// ErrorBoundary.js - Global Error Handling UI
// -------------------------------------------
// Provides a React error boundary for catching and displaying errors in the UI.
// Used to prevent app crashes and show user-friendly error messages.
// =============================================
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            timestamp: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorId = Date.now() + Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toISOString();

        // Enhanced error logging
        console.group(`🚨 ERROR BOUNDARY CAUGHT ERROR [${errorId}]`);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.error('Error Stack:', error.stack);
        console.error('Timestamp:', timestamp);

        // Check for specific "includes" error
        if (error.message && error.message.includes("Cannot read properties of undefined (reading 'includes')")) {
            console.error('🎯 DETECTED: This is the includes() error we are looking for!');
            console.error('Stack trace analysis:', error.stack);

            // Try to extract the exact line
            const stackLines = error.stack.split('\n');
            const relevantLines = stackLines.filter(line =>
                line.includes('.js:') && !line.includes('node_modules')
            );
            console.error('📍 Relevant source lines:', relevantLines);
        }

        console.groupEnd();

        this.setState({
            error: error,
            errorInfo: errorInfo,
            errorId: errorId,
            timestamp: timestamp
        });
    }

    render() {
        if (this.state.hasError) {
            const isDev = process.env.NODE_ENV === 'development';
            const isIncludesError = this.state.error?.message?.includes("Cannot read properties of undefined (reading 'includes')");

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className={`w-full bg-white rounded-lg shadow-md p-6 text-center ${isDev ? 'max-w-4xl' : 'max-w-md'}`}>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {isIncludesError ? '🎯 Found the "includes" Error!' : 'Something went wrong'}
                        </h2>

                        <p className="text-gray-600 mb-4">
                            {isIncludesError
                                ? 'This is the error we\'ve been hunting! Check the console for details.'
                                : 'We\'re sorry, but something unexpected happened. Please try refreshing the page.'
                            }
                        </p>

                        {isDev && this.state.errorId && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Error ID:</strong> {this.state.errorId}<br />
                                    <strong>Timestamp:</strong> {this.state.timestamp}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 justify-center mb-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Refresh Page
                            </button>
                            {isDev && (
                                <button
                                    onClick={() => {
                                        console.clear();
                                        console.log('🔄 Error boundary reset');
                                        this.setState({ hasError: false, error: null, errorInfo: null });
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Reset Boundary
                                </button>
                            )}
                        </div>

                        {isDev && this.state.error && (
                            <div className="space-y-4 text-left">
                                <details className="border border-gray-200 rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-3 bg-gray-50">
                                        🐛 Error Message & Type
                                    </summary>
                                    <div className="p-3 bg-red-50 border-t">
                                        <pre className="text-xs text-red-800 whitespace-pre-wrap">
                                            <strong>Type:</strong> {this.state.error.name}<br />
                                            <strong>Message:</strong> {this.state.error.message}
                                        </pre>
                                    </div>
                                </details>

                                <details className="border border-gray-200 rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-3 bg-gray-50">
                                        📍 Stack Trace (Filtered)
                                    </summary>
                                    <div className="p-3 bg-yellow-50 border-t">
                                        <pre className="text-xs text-yellow-800 whitespace-pre-wrap overflow-auto max-h-60">
                                            {this.state.error.stack
                                                ?.split('\n')
                                                .filter(line => !line.includes('node_modules'))
                                                .join('\n')
                                            }
                                        </pre>
                                    </div>
                                </details>

                                <details className="border border-gray-200 rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-3 bg-gray-50">
                                        🔗 Component Stack
                                    </summary>
                                    <div className="p-3 bg-blue-50 border-t">
                                        <pre className="text-xs text-blue-800 whitespace-pre-wrap overflow-auto max-h-40">
                                            {this.state.errorInfo?.componentStack}
                                        </pre>
                                    </div>
                                </details>

                                <details className="border border-gray-200 rounded-lg">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-3 bg-gray-50">
                                        🔧 Full Stack Trace
                                    </summary>
                                    <div className="p-3 bg-gray-50 border-t">
                                        <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-60">
                                            {this.state.error.stack}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 