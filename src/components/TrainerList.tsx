"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useBattleStore } from "@/store/battleStore";

interface Trainer {
    id: number;
    nome: string;
}

export default function TrainerList() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { connectSocket, trainer, setTrainer } = useBattleStore();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(false);
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
                const res = await api.get("/treinadores", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTrainers(res.data.treinadores || []);
            } catch (err: any) {
                setError("Erro ao buscar treinadores.");
            } finally {
                setLoading(false);
            }
        }
        fetchTrainers();
    }, [token, user, setTrainer, connectSocket]);

    useEffect(() => {
        if (!user) return;

        // Configurar listener para convites de batalha
        const handleBattleInvite = (data: {
            battleId: string;
            trainerAId: number;
            trainerBId: number;
            type: 'challenger' | 'challenged';
        }) => {
            console.log('🎯 Convite de batalha recebido:', data);

            if (data.type === 'challenged') {
                // Se foi desafiado, redirecionar para a batalha
                router.push(`/batalha/${data.battleId}`);
            } else {
                // Se foi o desafiador, mostrar mensagem de sucesso
                console.log('✅ Desafio enviado com sucesso!');
            }
        };

        // Adicionar listener (simulado por enquanto)
        // Em uma implementação real, isso viria do Socket.IO
        const handleCustomEvent = (event: Event) => {
            const customEvent = event as CustomEvent;
            handleBattleInvite(customEvent.detail);
        };

        window.addEventListener('battle-invite', handleCustomEvent);

        return () => {
            window.removeEventListener('battle-invite', handleCustomEvent);
        };
    }, [user, router]);

    async function handleDesafiar(trainerBId: number) {
        setDesafiando(trainerBId);
        setError("");
        try {
            const res = await api.post(`/desafiar/${trainerBId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('⚔️ Desafio enviado:', res.data);

            // Simular recebimento do convite (em uma implementação real seria via Socket.IO)
            setTimeout(() => {
                const event = new CustomEvent('battle-invite', {
                    detail: {
                        battleId: res.data.battleId,
                        trainerAId: res.data.trainerAId,
                        trainerBId: res.data.trainerBId,
                        type: 'challenger'
                    }
                });
                window.dispatchEvent(event);
            }, 1000);

        } catch (err: any) {
            setError(err?.response?.data?.error || "Erro ao desafiar treinador.");
        } finally {
            setDesafiando(null);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">Treinadores Disponíveis</h2>
            {error && <div className="text-red-400 text-center mb-4">{error}</div>}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow p-6">
                {loading ? (
                    <div className="text-center text-white">Carregando...</div>
                ) : (
                    <ul className="divide-y divide-white/20">
                        {trainers.filter(t => t.id !== user?.id).map(trainer => (
                            <li key={trainer.id} className="flex items-center justify-between py-3">
                                <span className="font-medium text-white">{trainer.nome}</span>
                                <button
                                    onClick={() => handleDesafiar(trainer.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    disabled={desafiando === trainer.id}
                                >
                                    {desafiando === trainer.id ? "Desafiando..." : "Desafiar"}
                                </button>
                            </li>
                        ))}
                        {trainers.filter(t => t.id !== user?.id).length === 0 && (
                            <li className="text-center text-white/70 py-4">Nenhum treinador disponível.</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
} 