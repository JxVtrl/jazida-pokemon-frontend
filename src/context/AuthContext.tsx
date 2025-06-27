"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import { useBattleStore } from "@/store/battleStore";

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
    const [showBattleInvite, setShowBattleInvite] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const router = useRouter();
    const { setTrainer, connectSocket, disconnectSocket, socket } = useBattleStore();

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

    // Persistir token/user no localStorage e conectar socket
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

    // Listener global para convites de batalha
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
            await api.post(`/desafiar/aceitar/${inviteData.battleId}`);
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
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
} 