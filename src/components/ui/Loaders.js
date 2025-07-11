// src/components/ui/Loaders.js
import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Package, ShoppingBag } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-6 h-6',
        large: 'w-8 h-8'
    };
    return <Loader2 className={`animate-spin ${sizeClasses[size]}`} />;
};

export const FullPageLoader = ({ message }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
        <div className="relative">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <span className="text-white font-bold text-2xl">T</span>
            </div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
        </div>
        <p className="text-lg font-medium text-gray-600 animate-pulse">{message || "Loading..."}</p>
    </div>
);

// Skeleton loader for item cards
export const ItemCardSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
        <div className="aspect-[4/5] bg-gray-200"></div>
        <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

// Skeleton loader for list items
export const ListItemSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div className="flex">
            <div className="w-32 h-32 bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    </div>
);

// Loading grid for items
export const ItemGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <ItemCardSkeleton key={index} />
        ))}
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
