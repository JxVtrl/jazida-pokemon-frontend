"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const tiposDisponiveis = ["pikachu", "charizard", "mewtwo"];

type Pokemon = {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
};

export default function TrainerDashboard() {
    const { user } = useAuth();
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [novoTipo, setNovoTipo] = useState(tiposDisponiveis[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function fetchPokemons() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/pokemons/me/pokemons");
            setPokemons(res.data);
        } catch (err: any) {
            setError("Erro ao buscar seus pokémons.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPokemons();
        // eslint-disable-next-line
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/pokemons", {
                tipo: novoTipo,
                treinador: user?.nome,
            });
            setNovoTipo(tiposDisponiveis[0]);
            fetchPokemons();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Erro ao criar pokémon.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Seus Pokémons</h2>
            <form onSubmit={handleCreate} className="flex gap-2 mb-6 justify-center">
                <select
                    value={novoTipo}
                    onChange={e => setNovoTipo(e.target.value)}
                    className="border rounded px-3 py-2"
                    disabled={loading}
                >
                    {tiposDisponiveis.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                    disabled={loading}
                >
                    {loading ? "Adicionando..." : "Adicionar Pokémon"}
                </button>
            </form>
            {error && <div className="text-red-600 text-center mb-4">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pokemons.map(pokemon => (
                    <div key={pokemon.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-200">
                        <div className="text-3xl mb-2">
                            {pokemon.tipo === "pikachu" && "⚡"}
                            {pokemon.tipo === "charizard" && "🔥"}
                            {pokemon.tipo === "mewtwo" && "🧠"}
                        </div>
                        <div className="font-bold text-lg capitalize mb-1">{pokemon.tipo}</div>
                        <div className="text-gray-600 text-sm mb-1">Nível: <span className="font-semibold">{pokemon.nivel}</span></div>
                        <div className="text-gray-500 text-xs">Treinador: {pokemon.treinador}</div>
                    </div>
                ))}
                {pokemons.length === 0 && !loading && (
                    <div className="col-span-2 text-center text-gray-500">Nenhum pokémon encontrado.</div>
                )}
            </div>
        </div>
    );
} 