"use client";

import PokemonCard from "@/components/PokemonCard";
import PokemonForm from "@/components/PokemonForm";
import BattleHUD from "@/components/BattleHUD";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Pokemon = {
  id: number;
  tipo: string;
  treinador: string;
  nivel: number;
};

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'battle'>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Recarregar pokémons quando voltar para a aba de lista
  useEffect(() => {
    if (activeTab === 'list') {
      fetchData();
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎮 Jazida Pokémon Challenge
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md">
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
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'list' ? (
        <div className="max-w-6xl mx-auto relative">
          {/* Botão flutuante para abrir drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg"
          >
            + Adicionar Pokémon
          </button>
          {/* Drawer do formulário */}
          <div className={`fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[60vh] overflow-y-auto rounded-t-2xl`}
            style={{ minHeight: '220px' }}
          >
            <div className="flex justify-between items-center px-6 pt-4 pb-2">
              <h3 className="text-lg font-bold">Adicionar novo Pokémon</h3>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setDrawerOpen(false)}>Fechar</button>
            </div>
            <div className="px-6 pb-6">
              <PokemonForm onCreated={() => { fetchData(); setDrawerOpen(false); }} />
            </div>
          </div>
          {/* Overlay para fechar o drawer ao clicar fora */}
          {drawerOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setDrawerOpen(false)}
            />
          )}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
            {pokemons.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        </div>
      ) : (
        <BattleHUD />
      )}
    </main>
  );
}
