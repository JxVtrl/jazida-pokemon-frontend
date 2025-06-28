"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useBattleStore } from "@/store/battleStore";

interface Trainer {
    id: number;
    nome: string;
    avatar_url?: string;
    total_battles: number;
    wins: number;
    losses: number;
    level: number;
    experience: number;
    winRate: number;
    status_message?: string;
}

export default function TrainerList() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { setTrainer, connectSocket } = useBattleStore();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [desafiando, setDesafiando] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        // Configurar treinador no store
        setTrainer({ id: user.id, nome: user.nome });

        // Conectar socket se ainda não estiver conectado
        connectSocket();

        async function fetchTrainers() {
            setLoading(true);
            setError("");
            try {
                const res = await api.get("/treinadores");
                console.log('✅ Treinadores recebidos:', res.data);
                
                // Calcular estatísticas para cada treinador
                const trainersWithStats = res.data.treinadores.map((trainer: any) => {
                    const winRate = trainer.total_battles > 0 
                        ? Math.round((trainer.wins / trainer.total_battles) * 100) 
                        : 0;
                    
                    return {
                        ...trainer,
                        winRate
                    };
                });
                
                setTrainers(trainersWithStats);
            } catch (err: any) {
                console.error('❌ Erro ao buscar treinadores:', err);
                setError("Erro ao carregar lista de treinadores");
            } finally {
                setLoading(false);
            }
        }
        fetchTrainers();
    }, [user, setTrainer, connectSocket]);

    const getWinRateColor = (winRate: number) => {
        if (winRate >= 70) return 'text-green-600';
        if (winRate >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getLevelColor = (level: number) => {
        if (level >= 10) return 'text-purple-600';
        if (level >= 5) return 'text-blue-600';
        return 'text-gray-600';
    };

    async function handleDesafiar(trainerBId: number) {
        setDesafiando(trainerBId);
        setError("");
        try {
            const res = await api.post(`/batalha/desafiar/${trainerBId}`);
            console.log('⚔️ Desafio enviado:', res.data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Erro ao desafiar treinador.");
        } finally {
            setDesafiando(null);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando treinadores...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={() => {
                        // Aqui você pode implementar a lógica para atualizar a lista de treinadores
                        fetchTrainers();
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (trainers.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">🥊</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum treinador encontrado</h3>
                <p className="text-gray-500">Não há treinadores disponíveis para batalha no momento.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {trainers.filter((trainer) => trainer.id !== user?.id).map((trainer) => (
                <div 
                    key={trainer.id}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
                >
                    {/* Header do Treinador */}
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                            <img
                                src={trainer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trainer.nome}`}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full border-2 border-gray-200"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{trainer.nome}</h3>
                            <p className="text-sm text-gray-500">
                                {trainer.status_message || 'Treinador Pokémon'}
                            </p>
                        </div>
                    </div>

                    {/* 
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Nível</span>
                            <span className={`font-bold ${getLevelColor(trainer.level)}`}>
                                {trainer.level}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Taxa de Vitória</span>
                            <span className={`font-bold ${getWinRateColor(trainer.winRate)}`}>
                                {trainer.winRate}%
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total de Batalhas</span>
                            <span className="font-bold text-gray-800">
                                {trainer.total_battles}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Vitórias</span>
                            <span className="font-bold text-green-600">
                                {trainer.wins}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Derrotas</span>
                            <span className="font-bold text-red-600">
                                {trainer.losses}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Experiência</span>
                            <span className="font-bold text-blue-600">
                                {trainer.experience}
                            </span>
                        </div>
                    </div> 
                    */}

                    {/* Botão de Desafio */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-semibold"
                            onClick={() => handleDesafiar(trainer.id)}
                        >
                            🥊 Desafiar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 