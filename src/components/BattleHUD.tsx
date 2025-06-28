'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from '@/lib/api';
import PokemonCard from "@/components/PokemonCard";

type Pokemon = {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
};

type BattleResult = {
    vencedor: Pokemon & { nivel: number };
    perdedor: Pokemon & { nivel: number; removido?: boolean };
    batalha: {
        vencedor: string;
        perdedor: string;
        probabilidadeVencedor: number;
        probabilidadePerdedor: number;
    };
};

export default function BattleHUD() {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [selectedPokemonA, setSelectedPokemonA] = useState<Pokemon | null>(null);
    const [selectedPokemonB, setSelectedPokemonB] = useState<Pokemon | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBattling, setIsBattling] = useState(false);
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Buscar lista de pokémons
    useEffect(() => {
        fetchPokemons();
    }, []);

    const fetchPokemons = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/pokemons');
            setPokemons(response.data);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar pokémons:', err);
            setError('Erro ao carregar pokémons');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePokemonSelect = (pokemon: Pokemon, isPokemonA: boolean) => {
        if (isPokemonA) {
            setSelectedPokemonA(pokemon);
        } else {
            setSelectedPokemonB(pokemon);
        }
        setBattleResult(null);
        setError(null);
    };

    const handleBattle = async () => {
        if (!selectedPokemonA || !selectedPokemonB) {
            setError('Selecione dois pokémons para batalhar');
            return;
        }

        if (selectedPokemonA.id === selectedPokemonB.id) {
            setError('Não é possível batalhar um pokémon contra ele mesmo');
            return;
        }

        try {
            setIsBattling(true);
            setError(null);
            setBattleResult(null);

            // Simular animação de batalha
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await api.post(`/batalhar/${selectedPokemonA.id}/${selectedPokemonB.id}`);
            const result: BattleResult = response.data;

            setBattleResult(result);

            // Atualizar lista de pokémons após a batalha
            await fetchPokemons();

            // Limpar seleções
            setSelectedPokemonA(null);
            setSelectedPokemonB(null);

        } catch (err: unknown) {
            console.error('Erro na batalha:', err);
            const errorMessage = err instanceof Error ? err.message : 'Erro ao realizar batalha';
            setError(errorMessage);
        } finally {
            setIsBattling(false);
        }
    };

    const getPokemonImage = (tipo: string) => {
        const images = {
            pikachu: '⚡',
            charizard: '🔥',
            mewtwo: '🧬'
        };
        return images[tipo as keyof typeof images] || '❓';
    };

    const getTypeColor = (tipo: string) => {
        const colors = {
            pikachu: 'bg-yellow-100 border-yellow-300',
            charizard: 'bg-red-100 border-red-300',
            mewtwo: 'bg-purple-100 border-purple-300'
        };
        return colors[tipo as keyof typeof colors] || 'bg-gray-100 border-gray-300';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 relative">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center" data-testid="battle-title">
                        ⚔️ Arena de Batalha Pokémon
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Pokémons Selecionados no topo */}
                    {(selectedPokemonA || selectedPokemonB) && (
                        <div className="mb-8 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-4" data-testid="battle-selected-title">Pokémons para Batalha:</h3>
                            <div className="flex flex-row gap-8 justify-center items-center">
                                {selectedPokemonA && (
                                    <div className="relative" data-testid="selected-pokemon-a">
                                        <PokemonCard pokemon={selectedPokemonA} data-testid="pokemon-card-selected-a" />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedPokemonA(null)}
                                            className="absolute top-2 right-2 z-10"
                                            data-testid="remove-pokemon-a"
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center justify-center text-3xl font-bold text-gray-400 select-none">
                                    VS
                                </div>
                                {selectedPokemonB && (
                                    <div className="relative" data-testid="selected-pokemon-b">
                                        <PokemonCard pokemon={selectedPokemonB} data-testid="pokemon-card-selected-b" />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedPokemonB(null)}
                                            className="absolute top-2 right-2 z-10"
                                            data-testid="remove-pokemon-b"
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {/* Botão de Batalha */}
                            {selectedPokemonA && selectedPokemonB && (
                                <div className="text-center mt-6">
                                    <Button
                                        onClick={handleBattle}
                                        disabled={isBattling}
                                        size="lg"
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                                        data-testid="battle-button"
                                    >
                                        {isBattling ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Batalhando...
                                            </>
                                        ) : (
                                            '⚔️ Batalhar!'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drawer de seleção de pokémons */}
                    <div>
                        <Button
                            onClick={() => setDrawerOpen(true)}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
                            data-testid="open-drawer-button"
                        >
                            Selecionar Pokémons
                        </Button>
                        {/* Drawer */}
                        <div className={`fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[70vh] overflow-y-auto rounded-t-2xl`}
                            style={{ minHeight: '300px' }}
                            data-testid="drawer-selector"
                        >
                            <div className="flex justify-between items-center px-6 pt-4 pb-2">
                                <h3 className="text-lg font-bold">Selecione dois pokémons para batalhar</h3>
                                <Button variant="ghost" onClick={() => setDrawerOpen(false)} data-testid="close-drawer-button">
                                    Fechar
                                </Button>
                            </div>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2">Carregando pokémons...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-6 pb-6">
                                    {pokemons.map((pokemon) => (
                                        <div
                                            key={pokemon.id}
                                            className={`cursor-pointer transition-all hover:scale-105 ${selectedPokemonA?.id === pokemon.id || selectedPokemonB?.id === pokemon.id
                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                : ''
                                                }`}
                                            onClick={() => {
                                                if (!selectedPokemonA) {
                                                    handlePokemonSelect(pokemon, true);
                                                } else if (!selectedPokemonB && selectedPokemonA.id !== pokemon.id) {
                                                    handlePokemonSelect(pokemon, false);
                                                }
                                            }}
                                            data-testid={`drawer-pokemon-${pokemon.id}`}
                                        >
                                            <PokemonCard pokemon={pokemon} data-testid="pokemon-card" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Overlay para fechar o drawer ao clicar fora */}
                        {drawerOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-30 z-40"
                                onClick={() => setDrawerOpen(false)}
                                data-testid="drawer-overlay"
                            />
                        )}
                    </div>

                    {/* Animação de Batalha */}
                    {isBattling && (
                        <div className="text-center py-8" data-testid="battle-animation">
                            <div className="flex justify-center items-center space-x-8 mb-4">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{selectedPokemonA && <PokemonCard pokemon={selectedPokemonA} data-testid="pokemon-card-battle-a" />}</div>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div className="text-2xl animate-bounce">⚔️</div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{selectedPokemonB && <PokemonCard pokemon={selectedPokemonB} data-testid="pokemon-card-battle-b" />}</div>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '40%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-lg font-semibold text-gray-600">Batalha em andamento...</p>
                        </div>
                    )}

                    {/* Resultado da Batalha */}
                    {battleResult && (
                        <Card className="border-2 border-green-500 bg-green-50" data-testid="battle-result">
                            <CardHeader>
                                <CardTitle className="text-center text-green-700">
                                    🏆 Resultado da Batalha
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Vencedor */}
                                    <Card className="border-2 border-yellow-400 bg-yellow-50" data-testid="battle-winner">
                                        <CardContent className="p-4 text-center">
                                            <div className="text-4xl mb-2">🏆</div>
                                            <h4 className="font-bold text-lg capitalize text-yellow-800">
                                                {battleResult.vencedor.tipo}
                                            </h4>
                                            <p className="text-sm text-yellow-700">
                                                Treinador: {battleResult.vencedor.treinador}
                                            </p>
                                            <p className="text-lg font-bold text-green-600">
                                                Novo Nível: {battleResult.vencedor.nivel} ⬆️
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Probabilidade: {(battleResult.batalha.probabilidadeVencedor * 100).toFixed(1)}%
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Perdedor */}
                                    <Card className={`border-2 ${battleResult.perdedor.removido
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-400 bg-gray-50'
                                        }`} data-testid="battle-loser">
                                        <CardContent className="p-4 text-center">
                                            <div className="text-4xl mb-2">
                                                {battleResult.perdedor.removido ? '💀' : '💔'}
                                            </div>
                                            <h4 className="font-bold text-lg capitalize">
                                                {battleResult.perdedor.tipo}
                                            </h4>
                                            <p className="text-sm">
                                                Treinador: {battleResult.perdedor.treinador}
                                            </p>
                                            <p className="text-lg font-bold text-red-600">
                                                {battleResult.perdedor.removido ? (
                                                    'Foi Derrotado! 💀'
                                                ) : (
                                                    `Novo Nível: ${battleResult.perdedor.nivel} ⬇️`
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Probabilidade: {(battleResult.batalha.probabilidadePerdedor * 100).toFixed(1)}%
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mensagem de Erro */}
                    {error && (
                        <Card className="border-2 border-red-500 bg-red-50" data-testid="battle-error">
                            <CardContent className="p-4 text-center">
                                <p className="text-red-700 font-semibold">❌ {error}</p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 