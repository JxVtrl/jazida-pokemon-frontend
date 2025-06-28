"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import { useBattleStore } from "@/store/battleStore";

interface User {
    id: number;
    nome: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    register: (nome: string, senha: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBattleInvite, setShowBattleInvite] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { setTrainer, connectSocket, disconnectSocket, socket } = useBattleStore();

    useEffect(() => {
        // Verificar se há token no localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setToken(token);
                setIsAuthenticated(true);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setTrainer({ id: user.id, nome: user.nome });
            connectSocket();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            disconnectSocket();
        }
    }, [token, user, setTrainer, connectSocket, disconnectSocket]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleBattleInvite = (data: any) => {
            console.log('🎯 Convite de batalha recebido:', data);
            if (data.type === "challenged") {
                setInviteData(data);
                setShowBattleInvite(true);
            }
        };

        socket.on("battle-invite", handleBattleInvite);

        return () => {
            socket.off("battle-invite", handleBattleInvite);
        };
    }, [socket, user]);

    const handleAcceptInvite = async () => {
        try {
            await api.post(`/batalha/aceitar/${inviteData.challengeId}`);
            setShowBattleInvite(false);
            setInviteData(null);
            // O redirecionamento será feito automaticamente pelo socket
        } catch (err: any) {
            console.error('Erro ao aceitar desafio:', err);
            alert('Erro ao aceitar desafio.');
            setShowBattleInvite(false);
            setInviteData(null);
        }
    };

    const handleDeclineInvite = () => {
        setShowBattleInvite(false);
        setInviteData(null);
    };

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        router.push('/');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['Authorization'];
        router.push('/login');
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated }}>
            {children}
            
            {/* Modal Global de Convite de Batalha */}
            {showBattleInvite && inviteData && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center min-w-[320px] max-w-md mx-4">
                        <div className="text-4xl mb-4">⚔️</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                            Você foi desafiado para uma batalha!
                        </h3>
                        <p className="mb-6 text-gray-600 text-center">
                            Um treinador quer duelar com você. Aceita o desafio?
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                                onClick={handleAcceptInvite}
                            >
                                ✅ Aceitar
                            </button>
                            <button
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                                onClick={handleDeclineInvite}
                            >
                                ❌ Recusar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 