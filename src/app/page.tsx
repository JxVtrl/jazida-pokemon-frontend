"use client";

import PokemonCard from "@/components/PokemonCard";
import PokemonForm from "@/components/PokemonForm";
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
    <main className="min-h-screen p-4 bg-gray-100">
      <PokemonForm onCreated={fetchData} />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </main>
  );
}
