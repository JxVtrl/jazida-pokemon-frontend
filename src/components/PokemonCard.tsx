import { Card, CardContent } from "@/components/ui/card";

type Pokemon = {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
};

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardContent className="p-4">
                <h2 className="text-xl font-bold capitalize">{pokemon.tipo}</h2>
                <p>Treinador: {pokemon.treinador}</p>
                <p>Nível: {pokemon.nivel}</p>
            </CardContent>
        </Card>
    );
}
