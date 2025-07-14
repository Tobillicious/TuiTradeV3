// =============================================
// ThemeContext.js - Dark/Light Theme State Management
// ---------------------------------------------------
// Provides context and provider for dark/light mode theme switching.
// Used throughout the app for consistent theming and user preference.
// =============================================
// src/context/ThemeContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        try {
            // Check for saved theme preference or default to light mode
            const savedTheme = typeof window !== 'undefined' && window.localStorage
                ? localStorage.getItem('theme')
                : null;

            // Check if matchMedia is available (not available in Jest/JSDOM)
            const prefersDark = typeof window !== 'undefined' && window.matchMedia
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                : false;

            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            } else if (prefersDark) {
                setIsDarkMode(true);
            }
        } catch (error) {
            console.warn('Theme initialization error:', error);
            // Default to light mode if any error occurs
            setIsDarkMode(false);
        }
    }, []);

    useEffect(() => {
        try {
            // Apply theme to document
            if (typeof window !== 'undefined' && window.document) {
                const root = window.document.documentElement;
                if (isDarkMode) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }

            // Save theme preference
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            }
        } catch (error) {
            console.warn('Theme application error:', error);
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};