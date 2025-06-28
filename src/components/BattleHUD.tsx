'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from '@/lib/api';

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

    // Buscar lista de pokémons
    useEffect(() => {
        fetchPokemons();
    }, []);

    const fetchPokemons = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/pokemons/public');
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

            const response = await api.post(`/batalha/${selectedPokemonA.id}/${selectedPokemonB.id}`);
            const result: BattleResult = response.data;

            setBattleResult(result);

            // Atualizar lista de pokémons após a batalha
            await fetchPokemons();

            // Limpar seleções
            setSelectedPokemonA(null);
            setSelectedPokemonB(null);

        } catch (err: any) {
            console.error('Erro na batalha:', err);
            setError(err.response?.data?.error || 'Erro ao realizar batalha');
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        ⚔️ Arena de Batalha Pokémon
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Lista de Pokémons */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Selecione dois pokémons para batalhar:</h3>

                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2">Carregando pokémons...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pokemons.map((pokemon) => (
                                    <Card
                                        key={pokemon.id}
                                        className={`cursor-pointer transition-all hover:scale-105 ${selectedPokemonA?.id === pokemon.id || selectedPokemonB?.id === pokemon.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : ''
                                            } ${getTypeColor(pokemon.tipo)}`}
                                        onClick={() => {
                                            if (!selectedPokemonA) {
                                                handlePokemonSelect(pokemon, true);
                                            } else if (!selectedPokemonB && selectedPokemonA.id !== pokemon.id) {
                                                handlePokemonSelect(pokemon, false);
                                            }
                                        }}
                                    >
                                        <CardContent className="p-4 text-center">
                                            <div className="text-4xl mb-2">{getPokemonImage(pokemon.tipo)}</div>
                                            <h4 className="font-bold capitalize text-lg">{pokemon.tipo}</h4>
                                            <p className="text-sm text-gray-600">Treinador: {pokemon.treinador}</p>
                                            <p className="text-sm font-semibold">Nível: {pokemon.nivel}</p>
                                            <p className="text-xs text-gray-500">ID: {pokemon.id}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Seleção de Pokémons */}
                    {(selectedPokemonA || selectedPokemonB) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Pokémons Selecionados:</h3>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                {selectedPokemonA && (
                                    <Card className={`${getTypeColor(selectedPokemonA.tipo)} border-2 border-blue-500`}>
                                        <CardContent className="p-4 text-center">
                                            <div className="text-3xl mb-2">{getPokemonImage(selectedPokemonA.tipo)}</div>
                                            <h4 className="font-bold capitalize">{selectedPokemonA.tipo}</h4>
                                            <p className="text-sm">Nível: {selectedPokemonA.nivel}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPokemonA(null)}
                                                className="mt-2"
                                            >
                                                Remover
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="flex items-center justify-center text-2xl font-bold text-gray-400">
                                    VS
                                </div>

                                {selectedPokemonB && (
                                    <Card className={`${getTypeColor(selectedPokemonB.tipo)} border-2 border-red-500`}>
                                        <CardContent className="p-4 text-center">
                                            <div className="text-3xl mb-2">{getPokemonImage(selectedPokemonB.tipo)}</div>
                                            <h4 className="font-bold capitalize">{selectedPokemonB.tipo}</h4>
                                            <p className="text-sm">Nível: {selectedPokemonB.nivel}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPokemonB(null)}
                                                className="mt-2"
                                            >
                                                Remover
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botão de Batalha */}
                    {selectedPokemonA && selectedPokemonB && (
                        <div className="text-center mb-6">
                            <Button
                                onClick={handleBattle}
                                disabled={isBattling}
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
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

                    {/* Animação de Batalha */}
                    {isBattling && (
                        <div className="text-center py-8">
                            <div className="flex justify-center items-center space-x-8 mb-4">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{getPokemonImage(selectedPokemonA?.tipo || '')}</div>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div className="text-2xl animate-bounce">⚔️</div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{getPokemonImage(selectedPokemonB?.tipo || '')}</div>
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
                        <Card className="border-2 border-green-500 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-center text-green-700">
                                    🏆 Resultado da Batalha
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Vencedor */}
                                    <Card className="border-2 border-yellow-400 bg-yellow-50">
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
                                        }`}>
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
                        <Card className="border-2 border-red-500 bg-red-50">
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