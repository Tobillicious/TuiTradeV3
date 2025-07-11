// src/components/ErrorBoundary.js
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }
        
        // Here you could send error to logging service
        // logErrorToService(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
                            </p>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={this.handleReload}
                                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    Try Again
                                </button>
                                
                                <button
                                    onClick={this.handleGoHome}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <Home className="w-5 h-5 mr-2" />
                                    Go to Homepage
                                </button>
                            </div>
                            
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center">
                                        <Bug className="w-4 h-4 mr-2" />
                                        View Error Details (Development)
                                    </summary>
                                    <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm">
                                        <div className="font-mono text-red-800">
                                            <strong>Error:</strong> {this.state.error.toString()}
                                        </div>
                                        {this.state.errorInfo && (
                                            <div className="mt-2 font-mono text-red-700 text-xs">
                                                <strong>Stack Trace:</strong>
                                                <pre className="mt-1 overflow-auto">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;