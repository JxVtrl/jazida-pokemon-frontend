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
                    <div className="flex justify-center gap-4 mb-2">
                        {tiposValidos.map((t) => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setTipo(t)}
                                className={`border-2 rounded-lg p-2 transition-all focus:outline-none ${tipo === t ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-400'}`}
                                aria-label={t}
                            >
                                <img
                                    src={`/8bit/${t}.webp`}
                                    alt={t}
                                    className="w-12 h-12 mx-auto"
                                />
                                <span className="block text-xs mt-1 capitalize font-semibold text-gray-700">{t}</span>
                            </button>
                        ))}
                    </div>
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
