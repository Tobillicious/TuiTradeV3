// src/components/ui/Loaders.js
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-6 h-6',
        large: 'w-8 h-8'
    };
    return <Loader2 className={`animate-spin ${sizeClasses[size]}`} />;
};

export const FullPageLoader = ({ message }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-lg">{message || "Loading..."}</p>
    </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-2 flex-shrink-0" size={20} />
            <div className="flex-1">
                <p className="text-red-800">{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className="text-red-600 underline text-sm mt-2">
                        Try again
                    </button>
                )}
            </div>
        </div>
    </div>
);

export const SuccessMessage = ({ message }) => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <p className="text-green-800">{message}</p>
        </div>
    </div>
);
