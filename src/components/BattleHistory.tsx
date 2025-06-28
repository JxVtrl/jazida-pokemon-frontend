import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface BattleHistoryItem {
    id: string;
    data: string;
    rounds: number;
    euSouA: boolean;
    meuPokemon: string;
    meuNivelAntes: number;
    meuNivelDepois: number;
    adversario: string;
    pokemonAdversario: string;
    vencedor: 'eu' | 'adversario';
    resultado: 'victory' | 'defeat';
}

export default function BattleHistory() {
    const [historico, setHistorico] = useState<BattleHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistorico();
    }, []);

    const fetchHistorico = async () => {
        try {
            setLoading(true);
            console.log('🔍 Buscando histórico de batalhas...');
            const response = await api.get('/battle-history');
            console.log('✅ Histórico recebido:', response.data);
            setHistorico(response.data);
        } catch (error) {
            console.error('❌ Erro ao buscar histórico:', error);
            setError('Erro ao carregar histórico de batalhas');
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getResultadoColor = (resultado: string) => {
        return resultado === 'victory' ? 'text-green-600' : 'text-red-600';
    };

    const getResultadoBg = (resultado: string) => {
        return resultado === 'victory' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    };

    const getNivelChange = (antes: number, depois: number) => {
        const change = depois - antes;
        if (change > 0) return { text: `+${change}`, color: 'text-green-600' };
        if (change < 0) return { text: `${change}`, color: 'text-red-600' };
        return { text: '0', color: 'text-gray-600' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando histórico...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchHistorico}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (historico.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma batalha encontrada</h3>
                <p className="text-gray-500">Participe de batalhas para ver seu histórico aqui!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📜 Histórico de Batalhas</h2>
                <button 
                    onClick={fetchHistorico}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                    🔄 Atualizar
                </button>
            </div>

            {historico.map((batalha) => {
                const nivelChange = getNivelChange(batalha.meuNivelAntes, batalha.meuNivelDepois);
                
                return (
                    <div 
                        key={batalha.id}
                        className={`border rounded-lg p-4 ${getResultadoBg(batalha.resultado)} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`text-lg font-bold ${getResultadoColor(batalha.resultado)}`}>
                                    {batalha.resultado === 'victory' ? '🏆' : '💔'}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {batalha.meuPokemon} vs {batalha.pokemonAdversario}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Contra {batalha.adversario}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">{formatarData(batalha.data)}</p>
                                <p className="text-xs text-gray-400">{batalha.rounds} rounds</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Meu Pokémon</p>
                                    <p className="font-semibold">{batalha.meuPokemon}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Lv.{batalha.meuNivelAntes}</span>
                                    <span className="text-blue-600">→</span>
                                    <span className="font-bold">Lv.{batalha.meuNivelDepois}</span>
                                    <span className={`font-bold ${nivelChange.color}`}>
                                        ({nivelChange.text})
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    batalha.resultado === 'victory' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {batalha.resultado === 'victory' ? 'VITÓRIA' : 'DERROTA'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 