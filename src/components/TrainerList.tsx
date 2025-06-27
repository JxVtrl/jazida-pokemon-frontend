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
    const { setTrainer, connectSocket } = useBattleStore();
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
                const res = await api.get("/treinadores");
                setTrainers(res.data.treinadores || []);
            } catch (err: any) {
                setError("Erro ao buscar treinadores.");
            } finally {
                setLoading(false);
            }
        }
        fetchTrainers();
    }, [user, setTrainer, connectSocket]);

    async function handleDesafiar(trainerBId: number) {
        setDesafiando(trainerBId);
        setError("");
        try {
            const res = await api.post(`/desafiar/${trainerBId}`);
            console.log('⚔️ Desafio enviado:', res.data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Erro ao desafiar treinador.");
        } finally {
            setDesafiando(null);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Treinadores Disponíveis</h2>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            <div className="bg-white rounded-lg shadow-lg p-6">
                {loading ? (
                    <div className="text-center text-gray-600">Carregando...</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {trainers.filter(t => t.id !== user?.id).map(trainer => (
                            <li
                                key={trainer.id}
                                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 transition rounded-lg group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                                        {trainer.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-gray-800 text-lg">{trainer.nome}</span>
                                </div>
                                <button
                                    onClick={() => handleDesafiar(trainer.id)}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow group-hover:scale-105 group-hover:shadow-md"
                                    disabled={desafiando === trainer.id}
                                >
                                    {desafiando === trainer.id ? "Desafiando..." : "Desafiar"}
                                </button>
                            </li>
                        ))}
                        {trainers.filter(t => t.id !== user?.id).length === 0 && (
                            <li className="text-center text-gray-400 py-4">Nenhum treinador disponível.</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
} 