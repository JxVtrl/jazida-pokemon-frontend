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
import { useAuth } from "@/context/AuthContext";
import type { Pokemon, BattleResult } from "@/types";

export default function Home() {
  const { user } = useAuth();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState<
    "list" | "battle" | "challenges" | "history" | "profile"
  >("list");
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const { setBattle } = useBattleStore();

  // Novos estados para filtro e ordenação
  const [pokemonFilter, setPokemonFilter] = useState<string>("");
  const [trainerFilter, setTrainerFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("nivel");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  async function fetchData() {
    try {
      console.log("🔄 Iniciando busca de pokémons...");
      const response = await api.get("/pokemons");
      console.log("✅ Pokémons recebidos:", response.data);
      setPokemons(response.data);
    } catch (error: unknown) {
      console.error("❌ Erro ao carregar pokémons:", error);
      const errorResponse = error as {
        response?: { data?: unknown; status?: number };
      };
      console.error("❌ Detalhes do erro:", errorResponse.response?.data);
      console.error("❌ Status do erro:", errorResponse.response?.status);
    }
  }

  useEffect(() => {
    // Só buscar pokémons se o usuário estiver autenticado
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Limpa o estado da batalha ao entrar na home
    setBattle(null);
  }, [setBattle]);

  // Verificar se há resultado de batalha no localStorage
  useEffect(() => {
    const checkBattleResult = () => {
      const battleData = localStorage.getItem("battleResult");
      if (battleData) {
        try {
          const result = JSON.parse(battleData);
          setBattleResult(result);
          setShowBattleModal(true);
          // Limpar dados do localStorage
          localStorage.removeItem("battleResult");

          // Recarregar pokémons para atualizar estatísticas
          console.log("🔄 Recarregando pokémons após resultado de batalha...");
          fetchData();
        } catch (error) {
          console.error("Erro ao processar resultado da batalha:", error);
          localStorage.removeItem("battleResult");
        }
      }
    };

    // Verificar imediatamente
    checkBattleResult();

    // Verificar quando a página ganha foco (usuário volta da batalha)
    const handleFocus = () => {
      checkBattleResult();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Função para aplicar filtros e ordenação
  function getFilteredAndSortedPokemons() {
    let filtered = pokemons;
    if (pokemonFilter) {
      filtered = filtered.filter((p) => p.tipo === pokemonFilter);
    }
    if (trainerFilter) {
      filtered = filtered.filter((p) => {
        const trainerName = p.treinador_nome || String(p.treinador) || "";
        return trainerName.toLowerCase().includes(trainerFilter.toLowerCase());
      });
    }
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case "winRate":
          valA = a.winRate || 0;
          valB = b.winRate || 0;
          break;
        case "vitorias":
          valA = a.vitorias || 0;
          valB = b.vitorias || 0;
          break;
        case "derrotas":
          valA = a.derrotas || 0;
          valB = b.derrotas || 0;
          break;
        case "batalhas":
          valA = a.batalhas || 0;
          valB = b.batalhas || 0;
          break;
        case "nivel":
        default:
          valA = a.nivel || 0;
          valB = b.nivel || 0;
          break;
      }
      if (sortOrder === "asc") return valA - valB;
      return valB - valA;
    });
    return sorted;
  }

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
            {activeTab === "list" ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    🏆 Ranking de Pokémons
                  </h2>
                  <p className="text-gray-600">
                    Veja todos os pokémons ordenados por nível, winrate,
                    vitórias, derrotas ou batalhas
                  </p>
                </div>
                {/* Painel de Filtros e Ordenação */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Filtrar por Pokémon
                    </label>
                    <select
                      value={pokemonFilter}
                      onChange={(e) => setPokemonFilter(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Todos</option>
                      <option value="pikachu">Pikachu</option>
                      <option value="charizard">Charizard</option>
                      <option value="mewtwo">Mewtwo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Filtrar por Treinador
                    </label>
                    <input
                      type="text"
                      value={trainerFilter}
                      onChange={(e) => setTrainerFilter(e.target.value)}
                      placeholder="Nome do treinador"
                      className="border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="nivel">Nível</option>
                      <option value="winRate">Winrate</option>
                      <option value="vitorias">Vitórias</option>
                      <option value="derrotas">Derrotas</option>
                      <option value="batalhas">Batalhas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ordem
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "asc" | "desc")
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="desc">Decrescente</option>
                      <option value="asc">Crescente</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {getFilteredAndSortedPokemons().map((pokemon) => (
                    <PokemonCard key={pokemon.id} pokemon={pokemon} />
                  ))}
                </div>
              </div>
            ) : activeTab === "challenges" ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    🥊 Treinadores Online
                  </h2>
                  <p className="text-gray-600">
                    Desafie outros treinadores para batalhas
                  </p>
                </div>
                <TrainerList />
              </div>
            ) : activeTab === "history" ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    📜 Histórico de Batalhas
                  </h2>
                  <p className="text-gray-600">
                    Reviva suas batalhas mais memoráveis
                  </p>
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
