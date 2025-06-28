"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import type { User } from "@/types";

export default function RegisterPage() {
    const { register, loading } = useAuth();
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await register(nome, senha);
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao registrar.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Nome</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                            minLength={3}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
                </div>
            </div>
        </div>
    );
} 