// context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for token in localStorage on initial load
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};