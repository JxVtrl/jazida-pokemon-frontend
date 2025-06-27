
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    nome: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (nome: string, senha: string) => Promise<void>;
    register: (nome: string, senha: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Carregar do localStorage ao iniciar
    useEffect(() => {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    // Persistir token/user no localStorage
    useEffect(() => {
        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token, user]);

    const login = async (nome: string, senha: string) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { nome, senha });
            setToken(res.data.token);
            setUser(res.data.treinador);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const register = async (nome: string, senha: string) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { nome, senha });
            setToken(res.data.token);
            setUser(res.data.treinador);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
} 