import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPokemonName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function calculateBattleProbability(nivelA: number, nivelB: number): number {
  if (nivelA <= 0) return 0.1;
  if (nivelB <= 0) return 0.9;

  if (nivelA === nivelB) return 0.5;

  const total = nivelA + nivelB;
  return nivelA / total;
}

export interface PokemonData {
  tipo: string;
  treinador: string;
  nivel: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePokemonData(data: PokemonData): ValidationResult {
  const errors: string[] = [];

  // Validar tipo
  const validTypes = ['pikachu', 'charizard', 'mewtwo'];
  if (!validTypes.includes(data.tipo)) {
    errors.push('Tipo inválido');
  }

  // Validar treinador
  if (!data.treinador || data.treinador.trim() === '') {
    errors.push('Treinador é obrigatório');
  }

  // Validar nível
  if (data.nivel < 0) {
    errors.push('Nível deve ser positivo');
  }

  if (data.nivel > 100) {
    errors.push('Nível máximo é 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPokemonEmoji(tipo: string): string {
  const emojis: Record<string, string> = {
    pikachu: '⚡',
    charizard: '🔥',
    mewtwo: '🧬'
  };

  return emojis[tipo] || '❓';
}

export function getPokemonColor(tipo: string): string {
  const colors: Record<string, string> = {
    pikachu: 'bg-yellow-100 border-yellow-300',
    charizard: 'bg-red-100 border-red-300',
    mewtwo: 'bg-purple-100 border-purple-300'
  };

  return colors[tipo] || 'bg-gray-100 border-gray-300';
}

export function getPokemonStats(tipo: string) {
  const stats = {
    pikachu: { hp: 60, attack: 30, energy: '⚡' },
    charizard: { hp: 150, attack: 200, energy: '🔥' },
    mewtwo: { hp: 130, attack: 90, energy: '🧬' }
  };

  return stats[tipo as keyof typeof stats] || { hp: 50, attack: 0, energy: '❓' };
} 