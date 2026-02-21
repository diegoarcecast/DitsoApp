import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (data: LoginRequest) => Promise<void>;
    signUp: (data: RegisterRequest) => Promise<void>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    async function loadStoredAuth() {
        try {
            // Por ahora, simplemente marcamos como no cargando
            // El usuario será null hasta que haga login
            setLoading(false);
        } catch (error) {
            console.error('Error loading stored auth:', error);
            setLoading(false);
        }
    }

    async function signIn(data: LoginRequest) {
        try {
            const response = await authService.login(data);
            setUser(response.user);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    async function signUp(data: RegisterRequest) {
        try {
            await authService.register(data);
            // Después del registro, automáticamente hacer login
            await signIn({ email: data.email, password: data.password });
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    async function signOut() {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signUp,
                signOut,
                isAuthenticated: user !== null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
