"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tiposValidos = ["pikachu", "charizard", "mewtwo"];

export default function PokemonForm({ onCreated }: { onCreated?: () => void }) {
    const [tipo, setTipo] = useState("");
    const [treinador, setTreinador] = useState("");
    const [erro, setErro] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        if (!tiposValidos.includes(tipo.toLowerCase())) {
            setErro("Tipo inválido. Escolha: pikachu, charizard ou mewtwo.");
            return;
        }

        try {
            await api.post("/pokemons", {
                tipo: tipo.toLowerCase(),
                treinador,
            });
            setTipo("");
            setTreinador("");
            onCreated?.();
        } catch (error) {
            console.error(error);
            setErro("Erro ao criar pokémon.");
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mb-6">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        placeholder="Tipo (pikachu, charizard, mewtwo)"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    />
                    <Input
                        placeholder="Nome do Treinador"
                        value={treinador}
                        onChange={(e) => setTreinador(e.target.value)}
                    />
                    {erro && <p className="text-red-600 text-sm">{erro}</p>}
                    <Button type="submit" className="w-full">
                        Criar Pokémon
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
