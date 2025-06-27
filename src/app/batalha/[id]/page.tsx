"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useBattleStore } from "@/store/battleStore";

interface BattlePokemon {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
    vida: number;
    vidaMaxima: number;
    status: 'ready' | 'attacking' | 'defending' | 'fainted';
}

export default function BatalhaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const {
        trainer,
        setTrainer,
        connectSocket,
        disconnectSocket,
        joinBattle,
        leaveBattle,
        battle,
        fetchMyPokemons,
        myPokemons
    } = useBattleStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPokemonSelector, setShowPokemonSelector] = useState(false);
    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

    useEffect(() => {
        if (!id || !user) return;

        // Configurar treinador no store
        setTrainer({ id: user.id, nome: user.nome });

        // Conectar socket
        connectSocket();

        // Buscar pokémons do treinador
        fetchMyPokemons();

        // Entrar na batalha
        joinBattle(id as string);

        setLoading(false);

        return () => {
            leaveBattle();
            disconnectSocket();
        };
    }, [id, user]);

    const handlePokemonSelect = async (pokemonId: number) => {
        setSelectedPokemonId(pokemonId);
        setShowPokemonSelector(false);

        try {
            // Aqui você faria a chamada para iniciar a batalha
            // Por enquanto, vamos simular
            console.log('Pokémon selecionado:', pokemonId);
        } catch (error) {
            setError('Erro ao selecionar pokémon');
        }
    };

    const getPokemonImage = (tipo: string) => {
        const images: { [key: string]: string } = {
            pikachu: '⚡',
            charizard: '🔥',
            mewtwo: '💜',
            bulbasaur: '🌱',
            squirtle: '💧'
        };
        return images[tipo] || '❓';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'attacking': return 'text-red-500 animate-pulse';
            case 'defending': return 'text-blue-500 animate-pulse';
            case 'fainted': return 'text-gray-500';
            default: return 'text-green-500';
        }
    };

    const getHealthBarColor = (vida: number, vidaMaxima: number) => {
        const percentage = (vida / vidaMaxima) * 100;
        if (percentage > 60) return 'bg-green-500';
        if (percentage > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <RequireAuth>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-xl">Carregando batalha...</p>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    if (error) {
        return (
            <RequireAuth>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
                    <div className="text-center text-white">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-4">
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white">⚔️ Batalha #{id}</h1>
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Voltar
                        </button>
                    </div>
                </div>

                {/* Arena de Batalha */}
                <div className="max-w-6xl mx-auto">
                    {!battle ? (
                        // Tela de seleção de pokémon
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-6">Selecione seu Pokémon</h2>

                            {myPokemons.length === 0 ? (
                                <div className="text-white">
                                    <p className="mb-4">Você não tem pokémons para batalhar!</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Criar Pokémon
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {myPokemons.map((pokemon) => (
                                        <button
                                            key={pokemon.id}
                                            onClick={() => handlePokemonSelect(pokemon.id)}
                                            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-all transform hover:scale-105"
                                        >
                                            <div className="text-4xl mb-2">{getPokemonImage(pokemon.tipo)}</div>
                                            <div className="text-white font-semibold">{pokemon.tipo}</div>
                                            <div className="text-white/70 text-sm">Nível {pokemon.nivel}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Arena de batalha
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                            {/* Status da batalha */}
                            <div className="text-center mb-8">
                                <div className="text-white text-lg mb-2">
                                    Round {battle.round} - {battle.status === 'fighting' ? '⚔️ Em batalha' :
                                        battle.status === 'finished' ? '🏆 Finalizada' : '⏳ Aguardando'}
                                </div>
                            </div>

                            {/* Pokémons */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Pokémon A */}
                                {battle.pokemonA && (
                                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border-2 border-blue-400">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">{getPokemonImage(battle.pokemonA.tipo)}</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{battle.pokemonA.tipo}</h3>
                                            <p className="text-white/70 mb-4">Nível {battle.pokemonA.nivel}</p>

                                            {/* Barra de vida */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-white text-sm mb-1">
                                                    <span>HP</span>
                                                    <span>{battle.pokemonA.vida}/{battle.pokemonA.vidaMaxima}</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${getHealthBarColor(battle.pokemonA.vida, battle.pokemonA.vidaMaxima)}`}
                                                        style={{ width: `${(battle.pokemonA.vida / battle.pokemonA.vidaMaxima) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className={`text-lg font-semibold ${getStatusColor(battle.pokemonA.status)}`}>
                                                {battle.pokemonA.status === 'attacking' ? '⚔️ Atacando' :
                                                    battle.pokemonA.status === 'defending' ? '🛡️ Defendendo' :
                                                        battle.pokemonA.status === 'fainted' ? '💀 Desmaiado' : '✅ Pronto'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* VS */}
                                <div className="flex items-center justify-center">
                                    <div className="text-6xl font-bold text-white animate-pulse">VS</div>
                                </div>

                                {/* Pokémon B */}
                                {battle.pokemonB && (
                                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl p-6 border-2 border-red-400">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">{getPokemonImage(battle.pokemonB.tipo)}</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{battle.pokemonB.tipo}</h3>
                                            <p className="text-white/70 mb-4">Nível {battle.pokemonB.nivel}</p>

                                            {/* Barra de vida */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-white text-sm mb-1">
                                                    <span>HP</span>
                                                    <span>{battle.pokemonB.vida}/{battle.pokemonB.vidaMaxima}</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${getHealthBarColor(battle.pokemonB.vida, battle.pokemonB.vidaMaxima)}`}
                                                        style={{ width: `${(battle.pokemonB.vida / battle.pokemonB.vidaMaxima) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className={`text-lg font-semibold ${getStatusColor(battle.pokemonB.status)}`}>
                                                {battle.pokemonB.status === 'attacking' ? '⚔️ Atacando' :
                                                    battle.pokemonB.status === 'defending' ? '🛡️ Defendendo' :
                                                        battle.pokemonB.status === 'fainted' ? '💀 Desmaiado' : '✅ Pronto'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resultado final */}
                            {battle.status === 'finished' && battle.winner && battle.loser && (
                                <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6">
                                    <h2 className="text-3xl font-bold text-white mb-4">🏆 Batalha Finalizada!</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Vencedor */}
                                        <div className="bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-xl p-4 border-2 border-yellow-400">
                                            <h3 className="text-xl font-bold text-yellow-300 mb-2">🥇 Vencedor</h3>
                                            <div className="text-4xl mb-2">{getPokemonImage(battle.winner.tipo)}</div>
                                            <div className="text-white font-semibold">{battle.winner.tipo}</div>
                                            <div className="text-white/70">Nível {battle.winner.nivel}</div>
                                        </div>

                                        {/* Perdedor */}
                                        <div className="bg-gradient-to-r from-gray-400/30 to-gray-600/30 rounded-xl p-4 border-2 border-gray-400">
                                            <h3 className="text-xl font-bold text-gray-300 mb-2">🥈 Perdedor</h3>
                                            <div className="text-4xl mb-2">{getPokemonImage(battle.loser.tipo)}</div>
                                            <div className="text-white font-semibold">{battle.loser.tipo}</div>
                                            <div className="text-white/70">Nível {battle.loser.nivel}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/')}
                                        className="mt-6 bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold"
                                    >
                                        Voltar ao Menu
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
} 