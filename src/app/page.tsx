"use client";

import PokemonCard from "@/components/PokemonCard";
import TrainerList from "@/components/TrainerList";
import BattleHistory from "@/components/BattleHistory";
import ProfileTab from "@/components/ProfileTab";
import BattleResultModal from "@/components/BattleResultModal";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useBattleStore } from "@/store/battleStore";
import type { Pokemon, BattleResult } from "@/types";

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'battle' | 'challenges' | 'history' | 'profile'>('list');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showBattleModal, setShowBattleModal] = useState(false);
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Conteúdo Principal */}
        <main className="pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content */}
            {activeTab === 'list' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🏆 Ranking de Pokémons</h2>
                  <p className="text-gray-600">Veja todos os pokémons ordenados por nível</p>
                </div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {pokemons.sort((a, b) => b.nivel - a.nivel).map((pokemon) => (
                    <PokemonCard key={pokemon.id} pokemon={pokemon} />
                  ))}
                </div>
              </div>
            ) : activeTab === 'challenges' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🥊 Treinadores Online</h2>
                  <p className="text-gray-600">Desafie outros treinadores para batalhas</p>
                </div>
                <TrainerList />
              </div>
            ) : activeTab === 'history' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">📜 Histórico de Batalhas</h2>
                  <p className="text-gray-600">Reviva suas batalhas mais memoráveis</p>
                </div>
                <BattleHistory />
              </div>
            ) : (
              <ProfileTab />
            )}
          </div>
        </main>

        {/* Battle Result Modal */}
        <BattleResultModal
          isOpen={showBattleModal}
          onClose={handleCloseBattleModal}
          pokemon={battleResult?.pokemon || null}
          result={battleResult?.result || null}
        />
      </div>
    </RequireAuth>
  );
}
