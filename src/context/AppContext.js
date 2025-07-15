// =============================================
// AppContext.js - Global App State Context
// ---------------------------------------------
// Provides a context for global app state (user, watchlist, cart, handlers).
// Used for sharing state and actions across the app without prop drilling.
// Includes development-time validation and logging for debugging.
// =============================================
// src/context/AppContext.js
import React, { createContext, useContext } from 'react';
import { logContextState, logError } from '../lib/logger';
import { validateContextState } from '../lib/debugUtils';

// Provide safe default values to prevent undefined errors
const defaultAppContext = {
    currentUser: null,
    watchedItems: [],
    cartItems: [],
    onWatchToggle: () => { },
    onAddToCart: () => { },
    onBuyNow: () => { },
    onContactSeller: () => { },
};

const AppContext = createContext(defaultAppContext);

export const AppProvider = ({ children, value }) => {
    // Enhanced validation in development
    if (process.env.NODE_ENV === 'development') {
        console.group('🔧 AppProvider: Validating provided value');
        console.log('Provided value:', value);

        if (value) {
            Object.entries(value).forEach(([key, val]) => {
                if ((key === 'watchedItems' || key === 'cartItems') && !Array.isArray(val)) {
                    console.error(`❌ ${key} should be an array but received:`, typeof val, val);
                }
            });
        }
        console.groupEnd();
    }

    // Merge provided values with defaults to ensure all properties exist
    const safeValue = { ...defaultAppContext, ...value };

    // Enhanced array validation
    safeValue.watchedItems = Array.isArray(safeValue.watchedItems) ? safeValue.watchedItems : [];
    safeValue.cartItems = Array.isArray(safeValue.cartItems) ? safeValue.cartItems : [];

    if (process.env.NODE_ENV === 'development') {
        console.log('🛡️ AppProvider: Final safe value:', safeValue);
        validateContextState('App', safeValue);
        logContextState('AppProvider', 'App', safeValue);
    }

    return <AppContext.Provider value={safeValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);

    if (process.env.NODE_ENV === 'development') {
        console.group('🔍 useAppContext: Hook called');
        console.log('Raw context:', context);
    }

    if (!context) {
        logError('Context', 'useAppContext used outside AppProvider!', null, 'useAppContext');
        console.trace('Call stack:');

        if (process.env.NODE_ENV === 'development') {
            // Alert in development to make this obvious
            window.debugDetector?.handleError({
                type: 'Context Error',
                message: 'useAppContext used outside AppProvider',
                stack: new Error().stack
            });
        }

        console.groupEnd();
        return defaultAppContext;
    }

    // Enhanced safety check with logging
    const safeContext = {
        ...context,
        watchedItems: Array.isArray(context.watchedItems) ? context.watchedItems : [],
        cartItems: Array.isArray(context.cartItems) ? context.cartItems : [],
    };

    // Log if we had to fix anything
    if (!Array.isArray(context.watchedItems)) {
        logError('ContextData', 'Fixed watchedItems - was not an array', {
            receivedType: typeof context.watchedItems,
            receivedValue: context.watchedItems
        }, 'useAppContext');

        window.debugDetector?.handleError({
            type: 'Context Data Error',
            message: `watchedItems was ${typeof context.watchedItems} instead of array`,
            value: context.watchedItems,
            stack: new Error().stack
        });
    }

    if (!Array.isArray(context.cartItems)) {
        logError('ContextData', 'Fixed cartItems - was not an array', {
            receivedType: typeof context.cartItems,
            receivedValue: context.cartItems
        }, 'useAppContext');

        window.debugDetector?.handleError({
            type: 'Context Data Error',
            message: `cartItems was ${typeof context.cartItems} instead of array`,
            value: context.cartItems,
            stack: new Error().stack
        });
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('✅ Safe context returned:', safeContext);
        window.debugDetector?.monitorContext('App', safeContext);
        logContextState('useAppContext', 'App', safeContext);
        console.groupEnd();
    }

    return safeContext;
};
