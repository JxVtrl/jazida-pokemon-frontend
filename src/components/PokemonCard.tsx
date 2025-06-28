import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import { useEffect, useState } from "react";
import { preloadGif } from "@/utils/imageCache";
import type { Pokemon } from "@/types";
import Image from "next/image";

const CARD_THEMES = {
  pikachu: {
    bg: "from-yellow-200 to-yellow-50",
    border: "border-yellow-300",
    topBar: "bg-yellow-100 border-yellow-400",
    status: "bg-yellow-50 border-yellow-200",
    footer: "bg-gradient-to-t from-yellow-100 to-yellow-50 border-yellow-300",
    icon: "⚡",
    color: "text-yellow-600",
    flavor:
      '"Quando está com raiva, descarrega imediatamente a energia armazenada nas bolsas em suas bochechas."',
  },
  charizard: {
    bg: "from-orange-200 to-orange-50",
    border: "border-orange-400",
    topBar: "bg-orange-100 border-orange-500",
    status: "bg-orange-50 border-orange-200",
    footer: "bg-gradient-to-t from-orange-100 to-orange-50 border-orange-400",
    icon: "🔥",
    color: "text-orange-600",
    flavor:
      '"Cospe chamas quentes o bastante para derreter rochedos. Estas chamas podem causar incêndios florestais."',
  },
  mewtwo: {
    bg: "from-purple-200 to-purple-50",
    border: "border-purple-400",
    topBar: "bg-purple-100 border-purple-500",
    status: "bg-purple-50 border-purple-200",
    footer: "bg-gradient-to-t from-purple-100 to-purple-50 border-purple-400",
    icon: "👁️",
    color: "text-purple-700",
    flavor:
      '"Seu poder psíquico é tão grande que pode controlar a mente de outros pokémons."',
  },
};

function getStage(nivel: number) {
  if (nivel >= 20) return "ESTÁGIO 3";
  if (nivel >= 10) return "ESTÁGIO 2";
  return "BÁSICO";
}

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const gifSrc = getPokemonGifByLevel(pokemon.tipo, pokemon.nivel);
  const [loaded, setLoaded] = useState(false);
  const theme =
    CARD_THEMES[pokemon.tipo as keyof typeof CARD_THEMES] ||
    CARD_THEMES.pikachu;
  const stage = getStage(pokemon.nivel);

  useEffect(() => {
    setLoaded(false);
    preloadGif(gifSrc).then(() => setLoaded(true));
  }, [gifSrc]);

  return (
    <div
      data-testid="card"
      className={`relative w-full sm:max-w-sm md:max-w-md mx-auto rounded-2xl border-4 ${theme.border} bg-gradient-to-b ${theme.bg} shadow-xl overflow-hidden p-0`}
      style={{ fontFamily: "inherit", minWidth: 200 }}
    >
      {/* Topo: Nome e Nível */}
      <div
        className={`flex justify-between items-center px-2 sm:px-4 pt-2 sm:pt-3 pb-1 border-b-2 ${theme.topBar}`}
      >
        <span className="uppercase text-[10px] sm:text-xs font-bold text-gray-700 tracking-widest bg-white/70 px-1.5 sm:px-2 py-0.5 rounded shadow-sm border border-gray-200">
          {stage}
        </span>
        <span className="text-lg sm:text-2xl font-extrabold text-gray-900 drop-shadow-sm">
          {pokemon.tipo.charAt(0).toUpperCase() + pokemon.tipo.slice(1)}
        </span>
        <span
          className={`flex items-center gap-1 font-bold text-base sm:text-lg ${theme.color}`}
        >
          <span>Lv.{pokemon.nivel}</span>
          <span>{theme.icon}</span>
        </span>
      </div>

      {/* Imagem do Pokémon */}
      <div
        className={`flex justify-center items-center bg-gradient-to-b ${theme.bg} h-28 sm:h-36 border-b-2 ${theme.border}`}
      >
        {loaded ? (
          <Image
            src={gifSrc}
            alt={pokemon.tipo}
            width={128}
            height={128}
            className="object-contain h-24 sm:h-32 w-auto drop-shadow-lg"
          />
        ) : (
          <span className="text-xs text-gray-400">Carregando...</span>
        )}
      </div>

      {/* Box de status/ataques */}
      <div
        className={`px-2 sm:px-4 py-2 sm:py-3 ${theme.status} border-b-2 ${theme.border}`}
      >
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold text-yellow-900">Batalhas:</span>
            <span className="font-mono text-gray-700">
              {pokemon.batalhas ?? 0}
            </span>
            <span className="font-bold text-green-700 ml-2 sm:ml-4">
              Vitórias:
            </span>
            <span className="font-mono text-gray-700">
              {pokemon.vitorias ?? 0}
            </span>
            <span className="font-bold text-red-700 ml-2 sm:ml-4">
              Derrotas:
            </span>
            <span className="font-mono text-gray-700">
              {pokemon.derrotas ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-indigo-700">Winrate:</span>
            <span className="font-mono text-gray-800">
              {pokemon.winRate ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé: Treinador e flavor */}
      <div
        className={`px-2 sm:px-4 py-1.5 sm:py-2 ${theme.footer} flex flex-col items-start`}
      >
        <span className="text-[11px] sm:text-xs text-gray-600 font-semibold">
          Treinador:{" "}
          <span className="text-gray-900 font-bold">
            {pokemon.treinador_nome || pokemon.treinador}
          </span>
        </span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1 italic">
          {theme.flavor}
        </span>
      </div>

      {/* Moldura prateada */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-gray-300 z-10"
        style={{ boxShadow: "0 0 0 4px #e5e7eb" }}
      />
    </div>
  );
}
