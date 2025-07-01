import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import Image from "next/image";
import { useBattleStore } from "@/store/battleStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BattleResultModal() {
  const { battle } = useBattleStore();
  const { user } = useAuth();
  const router = useRouter();

  if (
    battle?.status !== "finished" ||
    !battle ||
    !battle.winner ||
    !battle.loser ||
    !battle.pokemonA ||
    !battle.pokemonB
  )
    return null;

  const didIWin = user?.id === battle.winner?.treinador_id;
  const pokemon = didIWin ? battle.winner : battle.loser;
  const pokemonDied = pokemon?.nivel === 0;

  const nivelAnterior = (
    pokemon?.id === battle.pokemonA?.id ? battle.pokemonA : battle.pokemonB
  )?.nivel;
  console.log(`nivelAnterior: ${nivelAnterior}`);

  const getResultTitle = () => {
    switch (true) {
      case didIWin:
        return "🎉 Vitória!";
      case !didIWin && !pokemonDied:
        return "😔 Derrota";
      case pokemonDied:
        return "💀 Pokémon Derrotado";
      default:
        return "Batalha Finalizada";
    }
  };

  const getResultColor = () => {
    switch (true) {
      case didIWin:
        return "text-green-600";
      case !didIWin && !pokemonDied:
        return "text-yellow-600";
      case pokemonDied:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getResultMessage = () => {
    switch (true) {
      case didIWin:
        return "Seu pokémon ganhou experiência!";
      case !didIWin && !pokemonDied:
        return "Seu pokémon perdeu experiência...";
      case pokemonDied:
        return "Seu pokémon foi derrotado e não sobreviveu...";
      default:
        return "";
    }
  };

  const getLevelChange = (nivelAnterior: number, nivelAtual: number) => {
    if (!nivelAnterior) return null;
    const change = nivelAtual - nivelAnterior;
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
              src={getPokemonGifByLevel(
                pokemon?.tipo?.toLowerCase() ?? "",
                pokemon?.nivel ?? 0,
              )}
              alt={pokemon?.tipo ?? ""}
              width={128}
              height={128}
              className="w-32 h-32 object-contain mx-auto"
              unoptimized
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {pokemon?.tipo?.charAt(0).toUpperCase() + pokemon?.tipo?.slice(1)}
          </h3>

          {/* Level Animation */}
          <div className="flex items-center justify-center gap-4">
            {nivelAnterior !== undefined && (
              <span className="text-gray-500 text-lg">Lv.{nivelAnterior}</span>
            )}

            {nivelAnterior !== undefined && (
              <span className="text-2xl font-bold text-blue-600 animate-pulse">
                →
              </span>
            )}

            <div className="relative">
              <span
                className={`text-2xl font-bold transition-all duration-1000 ${
                  pokemon?.nivel > (nivelAnterior ?? 0)
                    ? "text-green-600 scale-110"
                    : pokemon?.nivel < (nivelAnterior ?? 0)
                      ? "text-red-600 scale-110"
                      : "text-gray-800"
                }`}
              >
                Lv.{pokemon?.nivel}
              </span>

              {/* Level Change Indicator */}
              {getLevelChange(nivelAnterior, pokemon?.nivel) && (
                <span
                  className={`absolute -top-2 -right-8 text-sm font-bold animate-bounce ${
                    getLevelChange(nivelAnterior, pokemon?.nivel)?.startsWith(
                      "+",
                    )
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getLevelChange(nivelAnterior, pokemon?.nivel)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Death Animation */}
        {pokemon?.nivel === 0 && (
          <div className="text-center mb-6">
            <div className="text-6xl animate-pulse text-red-600 mb-2">💀</div>
            <p className="text-red-600 font-semibold">
              Pokémon não sobreviveu à batalha
            </p>
          </div>
        )}

        {/* Victory Animation */}
        {pokemon?.nivel > nivelAnterior && (
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
            onClick={() => {
              router.push("/");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
