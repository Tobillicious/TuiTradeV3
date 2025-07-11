// src/context/NotificationContext.js
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-20 right-4 z-50 space-y-2">
                {notifications.map(({ id, message, type }) => (
                    <div
                        key={id}
                        className={`
                          p-4 rounded-lg shadow-lg transition-all transform animate-slide-in-right
                          ${type === 'error' ? 'bg-red-500 text-white' : ''}
                          ${type === 'success' ? 'bg-green-500 text-white' : ''}
                          ${type === 'info' ? 'bg-blue-500 text-white' : ''}
                        `}
                    >
                        {message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
