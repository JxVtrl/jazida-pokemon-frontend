import { useEffect, useState } from "react";
import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import type { Pokemon } from "@/types";
import Image from "next/image";

interface BattleResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: (Pokemon & { nivelAnterior?: number }) | null;
  result: "victory" | "defeat" | "death" | null;
}

export default function BattleResultModal({
  isOpen,
  onClose,
  pokemon,
  result,
}: BattleResultModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen && pokemon) {
      setShowAnimation(false);

      // Inicia a animação após um breve delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);
    }
  }, [isOpen, pokemon]);

  if (!isOpen || !pokemon) return null;

  const getResultTitle = () => {
    switch (result) {
      case "victory":
        return "🎉 Vitória!";
      case "defeat":
        return "😔 Derrota";
      case "death":
        return "💀 Pokémon Derrotado";
      default:
        return "Batalha Finalizada";
    }
  };

  const getResultColor = () => {
    switch (result) {
      case "victory":
        return "text-green-600";
      case "defeat":
        return "text-yellow-600";
      case "death":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getResultMessage = () => {
    switch (result) {
      case "victory":
        return "Seu pokémon ganhou experiência!";
      case "defeat":
        return "Seu pokémon perdeu experiência...";
      case "death":
        return "Seu pokémon foi derrotado e não sobreviveu...";
      default:
        return "";
    }
  };

  const getLevelChange = () => {
    if (!pokemon.nivelAnterior) return null;
    const change = pokemon.nivel - pokemon.nivelAnterior;
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return "0";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${getResultColor()}`}>
            {getResultTitle()}
          </h2>
          <p className="text-gray-600 mt-2">{getResultMessage()}</p>
        </div>

        {/* Pokémon Info */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <Image
              src={getPokemonGifByLevel(pokemon.tipo, pokemon.nivel)}
              alt={pokemon.tipo}
              className="w-32 h-32 object-contain mx-auto"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {pokemon.tipo}
          </h3>

          {/* Level Animation */}
          <div className="flex items-center justify-center gap-4">
            {pokemon.nivelAnterior !== undefined && (
              <span className="text-gray-500 text-lg">
                Lv.{pokemon.nivelAnterior}
              </span>
            )}

            {pokemon.nivelAnterior !== undefined && (
              <span className="text-2xl font-bold text-blue-600 animate-pulse">
                →
              </span>
            )}

            <div className="relative">
              <span
                className={`text-2xl font-bold transition-all duration-1000 ${
                  showAnimation
                    ? pokemon.nivel > (pokemon.nivelAnterior ?? 0)
                      ? "text-green-600 scale-110"
                      : pokemon.nivel < (pokemon.nivelAnterior ?? 0)
                        ? "text-red-600 scale-110"
                        : "text-gray-800"
                    : "text-gray-800"
                }`}
              >
                Lv.{pokemon.nivel}
              </span>

              {/* Level Change Indicator */}
              {showAnimation && getLevelChange() && (
                <span
                  className={`absolute -top-2 -right-8 text-sm font-bold animate-bounce ${
                    getLevelChange()?.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getLevelChange()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Death Animation */}
        {result === "death" && showAnimation && (
          <div className="text-center mb-6">
            <div className="text-6xl animate-pulse text-red-600 mb-2">💀</div>
            <p className="text-red-600 font-semibold">
              Pokémon não sobreviveu à batalha
            </p>
          </div>
        )}

        {/* Victory Animation */}
        {result === "victory" && showAnimation && (
          <div className="text-center mb-6">
            <div className="text-4xl animate-bounce text-yellow-500 mb-2">
              ⭐
            </div>
            <p className="text-green-600 font-semibold">Nível aumentou!</p>
          </div>
        )}

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
