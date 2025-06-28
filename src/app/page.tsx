"use client";

import PokemonCard from "@/components/PokemonCard";
import PokemonForm from "@/components/PokemonForm";
import BattleHUD from "@/components/BattleHUD";
import TrainerDashboard from "@/components/TrainerDashboard";
import TrainerList from "@/components/TrainerList";
import BattleHistory from "@/components/BattleHistory";
import BattleResultModal from "@/components/BattleResultModal";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useBattleStore } from "@/store/battleStore";

type Pokemon = {
  id: number;
  tipo: string;
  treinador: string;
  nivel: number;
};

interface BattleResult {
  pokemon: {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
    nivelAnterior: number;
  };
  result: 'victory' | 'defeat' | 'death';
}

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'battle' | 'dashboard' | 'challenges' | 'history'>('list');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const { user, logout } = useAuth();
  const { setBattle } = useBattleStore();

  async function fetchData() {
    try {
      console.log('🔄 Iniciando busca de pokémons...');
      const response = await api.get("/pokemons/public");
      console.log('✅ Pokémons recebidos:', response.data);
      setPokemons(response.data);
    } catch (error) {
      console.error("❌ Erro ao carregar pokémons:", error);
      console.error("❌ Detalhes do erro:", error.response?.data);
      console.error("❌ Status do erro:", error.response?.status);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Limpa o estado da batalha ao entrar na home
    setBattle(null);
  }, [setBattle]);

  // Verificar se há resultado de batalha no localStorage
  useEffect(() => {
    const checkBattleResult = () => {
      const battleData = localStorage.getItem('battleResult');
      if (battleData) {
        try {
          const result = JSON.parse(battleData);
          setBattleResult(result);
          setShowBattleModal(true);
          // Limpar dados do localStorage
          localStorage.removeItem('battleResult');
        } catch (error) {
          console.error('Erro ao processar resultado da batalha:', error);
          localStorage.removeItem('battleResult');
        }
      }
    };

    // Verificar imediatamente
    checkBattleResult();

    // Verificar quando a página ganha foco (usuário volta da batalha)
    const handleFocus = () => {
      checkBattleResult();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleCloseBattleModal = () => {
    setShowBattleModal(false);
    setBattleResult(null);
  };

  return (
    <RequireAuth>
      <main className="min-h-screen p-4 bg-gray-100">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              🎮 Jazida Pokémon Challenge
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm">{user?.nome}</span>
              <button
                onClick={logout}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-md flex flex-wrap">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                📋 Ranking
              </button>
              {/* <button
                onClick={() => setActiveTab('battle')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'battle'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                ⚔️ Arena
              </button> */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'dashboard'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🧑‍🎓 Meus Pokémons
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'challenges'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🥊 Desafios
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'history'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                📜 Histórico
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' ? (
          <div className="max-w-6xl mx-auto">
            {/* <PokemonForm onCreated={fetchData} /> */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
              {pokemons.sort((a, b) => b.nivel - a.nivel).map((pokemon) => {
                return (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                )
              })}
            </div>
          </div>
        ) : activeTab === 'battle' ? (
          <BattleHUD />
        ) : activeTab === 'dashboard' ? (
          <TrainerDashboard />
        ) : activeTab === 'challenges' ? (
          <TrainerList />
        ) : (
          <div className="max-w-4xl mx-auto">
            <BattleHistory />
          </div>
        )}

        {/* Battle Result Modal */}
        <BattleResultModal
          isOpen={showBattleModal}
          onClose={handleCloseBattleModal}
          pokemon={battleResult?.pokemon || null}
          result={battleResult?.result || null}
        />
      </main>
    </RequireAuth>
  );
}
