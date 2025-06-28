import { Card, CardContent } from "@/components/ui/card";
import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import { useEffect, useState } from "react";
import { preloadGif } from "@/utils/imageCache";

type Pokemon = {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
};

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
    const gifSrc = getPokemonGifByLevel(pokemon.tipo, pokemon.nivel);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        preloadGif(gifSrc).then(() => setLoaded(true));
    }, [gifSrc]);

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardContent className="p-4 flex flex-col items-center">
                <div className="w-24 aspect-square flex items-center justify-center overflow-hidden mb-2">
                    {loaded ? (
                        <img src={gifSrc} alt={pokemon.tipo} className="object-contain w-full h-full" />
                    ) : (
                        <span className="text-xs text-gray-400">Carregando...</span>
                    )}
                </div>
                <h2 className="text-xl font-bold capitalize">{pokemon.tipo}</h2>
                <p>Treinador: {pokemon.treinador}</p>
                <p>Nível: {pokemon.nivel}</p>
            </CardContent>
        </Card>
    );
}
