"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useBattleStore } from "@/store/battleStore";
import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import api from "@/lib/api";

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
    const [pokemonsLoading, setPokemonsLoading] = useState(false);
    const [aguardandoAdversario, setAguardandoAdversario] = useState(false);
    const [loadingBg, setLoadingBg] = useState("/assets/gifs/loading.gif");

    useEffect(() => {
        if (!id || !user) return;

        // Primeiro configurar treinador no store
        setTrainer({ id: user.id, nome: user.nome });

        // Depois conectar socket (que precisa do trainer configurado)
        connectSocket();

        // Buscar pokémons do treinador
        setPokemonsLoading(true);
        fetchMyPokemons().finally(() => {
            setPokemonsLoading(false);
        });

        // Entrar na batalha (após um pequeno delay para garantir que o socket está conectado)
        setTimeout(() => {
            joinBattle(id as string);
        }, 100);

        setLoading(false);

        return () => {
            leaveBattle();
            disconnectSocket();
        };
    }, [id, user, setTrainer, connectSocket, fetchMyPokemons, joinBattle, leaveBattle, disconnectSocket]);

    // Debug: logar pokémons quando mudarem
    useEffect(() => {
        console.log('🎯 Pokémons na página de batalha:', myPokemons);
    }, [myPokemons]);

    // Detectar quando o usuário sai da página
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🚪 Usuário saindo da página de batalha');
            leaveBattle();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log('🚪 Página ficou oculta');
                leaveBattle();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [leaveBattle]);

    const handlePokemonSelect = async (pokemonId: number) => {
        setSelectedPokemonId(pokemonId);
        setShowPokemonSelector(false);
        setAguardandoAdversario(true);
        try {
            await api.post(`/batalha/${id}/iniciar`, { pokemonAId: pokemonId });
            console.log('Pokémon selecionado e enviado para o backend:', pokemonId);
        } catch (error) {
            setError('Erro ao selecionar pokémon');
            setAguardandoAdversario(false);
        }
    };

    // Quando a batalha realmente começar, remove o estado de aguardando
    useEffect(() => {
        if (battle) {
            setAguardandoAdversario(false);
        }
    }, [battle]);

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

    // Sprites (agora usando GIFs)
    const getSprite = (tipo: string, nivel: number, back = false) => {
        // Se back, mostra o GIF de costas (ex: tipo-back.gif), senão o normal
        let gifPath = getPokemonGifByLevel(tipo, nivel);
        if (back) {
            // Tenta buscar um gif de costas, se existir
            const backGif = gifPath.replace('.gif', '-back.gif');
            // Se existir o arquivo, usa ele. Caso contrário, usa o normal.
            // Como não temos verificação de existência, sempre retorna o backGif (adicione os arquivos ou ajuste se necessário)
            return <img src={backGif} alt={tipo + " costas"} className="w-32 h-32 object-contain mx-auto" />;
        }
        return <img src={gifPath} alt={tipo} className="w-32 h-32 object-contain mx-auto" />;
    };

    useEffect(() => {
        const updateBg = () => {
            if (typeof window !== "undefined") {
                setLoadingBg(window.innerWidth <= 768 ? "/assets/gifs/loading_mobile.gif" : "/assets/gifs/loading.gif");
            }
        };
        updateBg();
        window.addEventListener("resize", updateBg);
        return () => window.removeEventListener("resize", updateBg);
    }, []);

    // --- NOVA INTERFACE VISUAL CLÁSSICA POKÉMON ---
    if (!battle) {
        if (!aguardandoAdversario) {
            // Mostrar seleção de pokémons
            return (
                <RequireAuth>
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
                        <div className="w-full max-w-2xl mx-auto mt-16 bg-black/40 rounded-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Selecione seu Pokémon</h2>
                            {myPokemons.map((pokemon) => (
                                <button
                                    key={pokemon.id}
                                    onClick={() => handlePokemonSelect(pokemon.id)}
                                    className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-all transform hover:scale-105 text-white font-semibold text-lg"
                                >
                                    {pokemon.tipo}
                                </button>
                            ))}
                        </div>
                    </div>
                </RequireAuth>
            );
        } else {
            // Mostrar loading aguardando adversário
            return (
                <RequireAuth>
                    <div className="min-h-screen flex items-center justify-center relative" style={{ background: `url(${loadingBg}) center center / cover no-repeat, linear-gradient(to bottom right, #1e3a8a, #6d28d9, #b91c1c)` }}>
                        <div className="absolute inset-0" />
                        <div className="text-center text-white z-10 w-full">
                            <p className="text-2xl font-bold drop-shadow-lg">Aguardando o adversário escolher...</p>
                        </div>
                    </div>
                </RequireAuth>
            );
        }
    }

    // Só executa daqui pra frente se battle existe
    // Caixa de mensagem
    let message = '';
    if (battle.status === 'finished' && battle.winner && battle.loser) {
        message = `Vitória de ${battle.winner.treinador || battle.winner.tipo}!`; 
    } else if (battle.status === 'fighting') {
        message = `Round ${battle.round} - A batalha está em andamento!`;
    } else if (battle.status === 'starting') {
        message = 'Preparando batalha...';
    } else {
        message = 'Aguardando ação dos treinadores...';
    }

    // CORREÇÃO: Determinar qual pokémon é do treinador atual e qual é do adversário
    const myPokemon = battle.pokemonA.treinador === user?.id ? battle.pokemonA : battle.pokemonB;
    const opponentPokemon = battle.pokemonA.treinador === user?.id ? battle.pokemonB : battle.pokemonA;

    const handleVoltarHome = () => {
        // Salvar resultado da batalha no localStorage
        if (battle && battle.winner && battle.loser) {
            // Determinar qual pokémon é do treinador atual
            const myPokemon = battle.pokemonA.treinador === user?.id ? battle.pokemonA : battle.pokemonB;
            const isWinner = battle.winner.id === myPokemon.id;
            const isLoser = battle.loser.id === myPokemon.id;
            
            // Determinar o resultado
            let result: 'victory' | 'defeat' | 'death';
            if (isWinner) {
                result = 'victory';
            } else if (isLoser && battle.loser.nivel <= 0) {
                result = 'death';
            } else {
                result = 'defeat';
            }

            // Calcular nível anterior (reverter a mudança da batalha)
            let nivelAnterior = myPokemon.nivel;
            if (isWinner) {
                nivelAnterior = myPokemon.nivel - 1; // Vencedor ganhou +1, então anterior = atual - 1
            } else if (isLoser) {
                nivelAnterior = myPokemon.nivel + 1; // Perdedor perdeu -1, então anterior = atual + 1
            }

            // Salvar dados da batalha
            const battleResult = {
                pokemon: {
                    ...myPokemon,
                    nivelAnterior
                },
                result
            };

            localStorage.setItem('battleResult', JSON.stringify(battleResult));
        }

        leaveBattle();
        window.location.href = '/';
    };

    return (
        <RequireAuth>
            <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-4">
                {/* Indicador de Round */}
                {battle.status === 'fighting' && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                            ROUND {battle.round}
                        </div>
                    </div>
                )}

                {/* Status dos pokémons */}
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 mt-8">
                    {/* Oponente (Topo) */}
                    {battle.pokemonB && (
                        <div className="flex flex-col items-end">
                            <div className="bg-white/80 rounded-lg shadow-lg px-4 py-2 w-72 mb-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800 text-lg">{battle.pokemonB.tipo}</span>
                                    <span className="text-gray-700 font-mono">Lv{battle.pokemonB.nivel}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">HP</span>
                                    <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
                                        <div className={`h-3 transition-all duration-500 ${getHealthBarColor(battle.pokemonB.vida, battle.pokemonB.vidaMaxima)}`} style={{ width: `${(battle.pokemonB.vida / battle.pokemonB.vidaMaxima) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-700 ml-2">{battle.pokemonB.vida}/{battle.pokemonB.vidaMaxima}</span>
                                </div>
                            </div>
                            {/* Sprite do oponente (frente) */}
                            <div className="-mb-8 mt-2 flex justify-end w-full">
                                <div className={`${battle.status === 'fighting' ? 'animate-pulse' : ''}`}>
                                    {getSprite(battle.pokemonB.tipo, battle.pokemonB.nivel, false)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Player (Baixo) */}
                    {battle.pokemonA && (
                        <div className="flex flex-col items-start mt-24">
                            {/* Sprite do player (costas) */}
                            <div className="-mb-8 flex justify-start w-full">
                                <div className={`${battle.status === 'fighting' ? 'animate-pulse' : ''}`}>
                                    {getSprite(battle.pokemonA.tipo, battle.pokemonA.nivel, true)}
                                </div>
                            </div>
                            <div className="bg-white/80 rounded-lg shadow-lg px-4 py-2 w-72 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800 text-lg">{battle.pokemonA.tipo}</span>
                                    <span className="text-gray-700 font-mono">Lv{battle.pokemonA.nivel}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">HP</span>
                                    <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
                                        <div className={`h-3 transition-all duration-500 ${getHealthBarColor(battle.pokemonA.vida, battle.pokemonA.vidaMaxima)}`} style={{ width: `${(battle.pokemonA.vida / battle.pokemonA.vidaMaxima) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-700 ml-2">{battle.pokemonA.vida}/{battle.pokemonA.vidaMaxima}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Caixa de mensagem */}
                <div className="w-full max-w-2xl mx-auto mt-16 mb-8">
                    <div className="bg-white/90 rounded-xl shadow-lg p-6 text-xl font-mono text-gray-800 text-center min-h-[64px] flex items-center justify-center">
                        {battle.status === 'finished' && battle.winner && battle.loser ? (
                            <div className="text-center">
                                <div className="mb-4">
                                    <span className="font-bold text-green-700 text-2xl mr-2">{battle.winner.treinador || battle.winner.tipo}</span>
                                    venceu!
                                    <span className="ml-4 text-gray-500 text-lg">({battle.loser.treinador || battle.loser.tipo} perdeu)</span>
                                </div>
                                <button
                                    onClick={handleVoltarHome}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                                >
                                    🏠 Voltar para Home
                                </button>
                            </div>
                        ) : (
                            <span>{message}</span>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
} 