// =============================================
// AuthContext.js - Authentication State Context
// ---------------------------------------------
// Provides context and hook for authentication state (user, auth actions).
// Used throughout the app for user authentication and access control.
// =============================================
// src/context/AuthContext.js
import { createContext, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
