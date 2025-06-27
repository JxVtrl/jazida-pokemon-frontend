"use client";

import PokemonCard from "@/components/PokemonCard";
import PokemonForm from "@/components/PokemonForm";
import BattleHUD from "@/components/BattleHUD";
import TrainerDashboard from "@/components/TrainerDashboard";
import TrainerList from "@/components/TrainerList";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

type Pokemon = {
  id: number;
  tipo: string;
  treinador: string;
  nivel: number;
};

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'battle' | 'dashboard' | 'challenges'>('list');
  const { user, logout } = useAuth();

  async function fetchData() {
    try {
      const response = await api.get("/pokemons");
      setPokemons(response.data);
    } catch (error) {
      console.error("Erro ao carregar pokémons:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
            <div className="bg-white rounded-lg p-1 shadow-md flex">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                📋 Lista de Pokémons
              </button>
              <button
                onClick={() => setActiveTab('battle')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'battle'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                ⚔️ Arena de Batalha
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'dashboard'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🧑‍🎓 Meus Pokémons
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'challenges'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                🥊 Desafios
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' ? (
          <div className="max-w-6xl mx-auto">
            {/* <PokemonForm onCreated={fetchData} /> */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
              {pokemons.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
            </div>
          </div>
        ) : activeTab === 'battle' ? (
          <BattleHUD />
        ) : activeTab === 'dashboard' ? (
          <TrainerDashboard />
        ) : (
          <TrainerList />
        )}
      </main>
    </RequireAuth>
  );
}
