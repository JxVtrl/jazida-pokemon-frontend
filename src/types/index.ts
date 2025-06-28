// Tipos globais e compartilhados do frontend

export interface User {
  id: number;
  nome: string;
  avatar_url?: string;
}

export interface Pokemon {
  id: number;
  tipo: string;
  treinador: string | number;
  nivel: number;
  nivelAnterior?: number;
}

export interface BattleResult {
  pokemon: Pokemon;
  result: 'victory' | 'defeat' | 'death';
}

export interface BattlePokemon {
  id: number;
  tipo: string;
  treinador: string | number;
  nivel: number;
  vida: number;
  vidaMaxima: number;
  status: 'ready' | 'attacking' | 'defending' | 'fainted';
} 