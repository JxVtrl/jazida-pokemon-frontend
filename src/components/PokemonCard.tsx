import Image from "next/image";

const gifMap: Record<string, string> = {
    pikachu: "/gifs/pikachu.gif",
    charizard: "/gifs/charizard.gif",
    mewtwo: "/gifs/mewtwo.gif"
};

type Pokemon = {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
};

type PokemonCardProps = {
    pokemon: Pokemon;
    'data-testid'?: string;
};

const cardConfig = {
    pikachu: {
        color: "bg-yellow-50 border-yellow-400",
        hp: 60,
        energy: "⚡",
        energyName: "Lightning",
        name: "Pikachu",
        emoji: "⚡",
        attack: { name: "Bola Elétrica", value: 30, desc: "Ligue 1 carta de Energia ⚡ da sua pilha de descarte a este Pokémon." },
        flavor: "Quando Pikachu se encontram, encostam suas caudas e trocam eletricidade como saudação."
    },
    charizard: {
        color: "bg-orange-50 border-orange-400",
        hp: 150,
        energy: "🔥",
        energyName: "Fire",
        name: "Charizard",
        emoji: "🔥",
        attack: { name: "Fire Spin", value: 200, desc: "Descarte 3 Energias ligadas a este Pokémon." },
        flavor: "Suas asas podem carregá-lo até altitudes elevadas. Cospe fogo a temperaturas altíssimas."
    },
    mewtwo: {
        color: "bg-purple-50 border-purple-400",
        hp: 130,
        energy: "🧬",
        energyName: "Psychic",
        name: "Mewtwo",
        emoji: "🧬",
        attack: { name: "Psypump", value: 90, desc: "Ligue até 2 cartas de Energia 🧬 da pilha de descarte a 1 dos seus Pokémon." },
        flavor: "Criado a partir do DNA de Mew, dizem que tem o coração mais selvagem entre os Pokémon."
    }
};

export default function PokemonCard({ pokemon, 'data-testid': testId }: PokemonCardProps) {
    const config = cardConfig[pokemon.tipo as keyof typeof cardConfig] || {
        color: "bg-gray-100 border-gray-300",
        hp: 50,
        energy: "❓",
        energyName: "",
        name: pokemon.tipo,
        emoji: "❓",
        attack: { name: "Ataque Desconhecido", value: 0, desc: "---" },
        flavor: "Pokémon misterioso."
    };
    const gifSrc = gifMap[pokemon.tipo] || null;
    const cardSize = 'w-[250px]';
    return (
        <div
            className={`rounded-2xl border-8 shadow-xl mx-auto bg-gradient-to-b from-yellow-100 to-white relative overflow-hidden ${config.color} ${cardSize}`}
            style={{ aspectRatio: '5 / 7' }}
            data-testid={testId || 'pokemon-card'}
        >
            <div className="absolute inset-0 flex flex-col min-w-0 gap-1">
                {/* Topo: Nome, HP, energia */}
                <div className="flex items-center px-3 pt-2 pb-1 min-w-0">
                    <span className="font-bold capitalize tracking-wide text-gray-900 drop-shadow-sm truncate block min-w-0" style={{ fontSize: '1rem', maxWidth: '110px', lineHeight: '1.1' }}>{config.name}</span>
                    <span className="flex-shrink-0 flex items-center gap-1 font-bold text-purple-900 drop-shadow-sm ml-auto whitespace-nowrap" style={{ fontSize: '0.9rem' }}>HP {config.hp} <span className="text-xl">{config.energy}</span></span>
                </div>
                {/* Linha fina */}
                <div className="border-t border-yellow-300 mx-2 mb-1" />
                {/* GIF central ou emoji */}
                <div className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[90px] min-w-0`}>
                    {gifSrc ? (
                        <Image
                            src={gifSrc}
                            alt={config.name}
                            width={80}
                            height={80}
                            className={`w-auto mb-1 drop-shadow-lg h-[100%]`}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div className={`text-7xl mb-1 drop-shadow-lg`}>{config.emoji}</div>
                    )}
                    <div className="text-xs text-gray-500 mb-1">ID: {pokemon.id}</div>
                </div>
                {/* Box de informações */}
                <div className={`bg-white/80 rounded-lg mx-2 px-2 py-1 shadow-inner border border-yellow-200 mb-1 text-xs min-w-0`}>
                    <div className="flex justify-between items-center mb-1 min-w-0 text-[10px]">
                        <span className="font-semibold text-gray-700">Nível:</span>
                        <span className="font-bold text-gray-800">{pokemon.nivel}</span>
                    </div>
                    <div className="flex justify-between items-center min-w-0 text-[10px]">
                        <span className="font-semibold text-gray-700">Treinador:</span>
                        <span className="font-bold text-blue-700 break-words min-w-0 max-w-[90px]" style={{ wordBreak: 'break-word' }}>{pokemon.treinador}</span>
                    </div>
                </div>
                {/* Ataque */}
                <div className={`mx-2 mb-1 bg-gradient-to-r from-white via-gray-50 to-white rounded px-1 py-0.5 border border-gray-200 shadow-sm text-[10px] min-w-0`}>
                    <div className="flex justify-between items-center min-w-0 text-[10px]">
                        <span className="font-bold text-gray-800 break-words min-w-0 max-w-[90px]" style={{ wordBreak: 'break-word' }}>{config.attack.name}</span>
                        <span className="font-bold text-gray-700">{config.attack.value}</span>
                    </div>

                </div>


                {/* flavor text */}
                <div className="pb-1 italic text-gray-500 text-center text-[10px] break-words min-w-0" style={{ wordBreak: 'break-word' }}>{config.flavor}</div>
            </div>
        </div>
    );
}
