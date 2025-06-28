"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const tiposValidos = ["pikachu", "charizard", "mewtwo"];

export default function PokemonForm({ onCreated }: { onCreated?: () => void }) {
    const [tipo, setTipo] = useState("");
    const [treinador, setTreinador] = useState("");
    const [nivel, setNivel] = useState(1);
    const [erro, setErro] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        if (!tiposValidos.includes(tipo.toLowerCase())) {
            setErro("Tipo inválido. Escolha: pikachu, charizard ou mewtwo.");
            return;
        }

        if (!treinador.trim()) {
            setErro("Nome do treinador é obrigatório.");
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/pokemons", {
                tipo: tipo.toLowerCase(),
                treinador: treinador.trim(),
                nivel: nivel
            });
            setTipo("");
            setTreinador("");
            setNivel(1);
            setErro("");
            setIsLoading(false);
            if (onCreated) onCreated();
        } catch (error) {
            console.error(error);
            setErro("Erro ao criar pokémon.");
            setIsLoading(false);
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
                                <Image
                                    src={`/8bit/${t}.webp`}
                                    alt={t}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 mx-auto"
                                />
                                <span className="block text-xs mt-1 capitalize font-semibold text-gray-700">{t}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div>
                        <label htmlFor="treinador" className="block text-sm font-medium text-gray-700 mb-1">
                            Treinador
                        </label>
                        <Input
                            id="treinador"
                            placeholder="Nome do Treinador"
                            value={treinador}
                            onChange={(e) => setTreinador(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                            Nível
                        </label>
                        <Input
                            id="nivel"
                            type="number"
                            min="1"
                            max="100"
                            value={nivel}
                            onChange={(e) => {
                                const val = e.target.valueAsNumber;
                                if (isNaN(val) || val < 1) setNivel(1);
                                else setNivel(val);
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    
                    {erro && <p className="text-red-600 text-sm">{erro}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando..." : "Criar Pokémon"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
