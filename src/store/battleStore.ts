import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

interface Pokemon {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
}

interface Trainer {
    id: number;
    nome: string;
}

interface BattlePokemon {
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
    vida: number;
    vidaMaxima: number;
    status: 'ready' | 'attacking' | 'defending' | 'fainted';
}

interface BattleState {
    id: string;
    pokemonA: BattlePokemon | null;
    pokemonB: BattlePokemon | null;
    status: 'waiting' | 'starting' | 'fighting' | 'finished';
    winner: BattlePokemon | null;
    loser: BattlePokemon | null;
    round: number;
}

interface BattleStore {
    // Treinador autenticado
    trainer: Trainer | null;
    setTrainer: (trainer: Trainer | null) => void;

    // Pokémons do treinador
    myPokemons: Pokemon[];
    setMyPokemons: (pokemons: Pokemon[]) => void;
    fetchMyPokemons: () => Promise<void>;

    // Estado da batalha
    battle: BattleState | null;
    setBattle: (battle: BattleState | null) => void;

    // Socket
    socket: Socket | null;
    connectSocket: () => void;
    disconnectSocket: () => void;

    // Ações da batalha
    joinBattle: (battleId: string) => void;
    leaveBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
    // Estado inicial
    trainer: null,
    myPokemons: [],
    battle: null,
    socket: null,

    // Setters
    setTrainer: (trainer) => set({ trainer }),
    setMyPokemons: (pokemons) => set({ myPokemons: pokemons }),
    setBattle: (battle) => set({ battle }),

    // Buscar pokémons do treinador
    fetchMyPokemons: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await api.get('/me/pokemons', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ myPokemons: response.data.pokemons || [] });
        } catch (error) {
            console.error('Erro ao buscar pokémons:', error);
        }
    },

    // Socket management
    connectSocket: () => {
        const { trainer } = get();
        if (!trainer || get().socket) return;

        const socket = io(api.defaults.baseURL!, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('🔗 Socket conectado');
            socket.emit('register', trainer.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket desconectado');
        });

        // Eventos de batalha
        socket.on('battle:start', (data: {
            battleId: string;
            pokemonA: BattlePokemon;
            pokemonB: BattlePokemon;
        }) => {
            console.log('⚔️ Batalha iniciada:', data);
            set({
                battle: {
                    id: data.battleId,
                    pokemonA: data.pokemonA,
                    pokemonB: data.pokemonB,
                    status: 'starting',
                    winner: null,
                    loser: null,
                    round: 1
                }
            });
        });

        socket.on('battle:update', (data: {
            pokemonA: BattlePokemon;
            pokemonB: BattlePokemon;
            round: number;
        }) => {
            console.log('🔄 Atualização da batalha:', data);
            const { battle } = get();
            if (battle) {
                set({
                    battle: {
                        ...battle,
                        pokemonA: data.pokemonA,
                        pokemonB: data.pokemonB,
                        round: data.round,
                        status: 'fighting'
                    }
                });
            }
        });

        socket.on('battle:end', (data: {
            winner: BattlePokemon;
            loser: BattlePokemon;
        }) => {
            console.log('🏆 Batalha finalizada:', data);
            const { battle } = get();
            if (battle) {
                set({
                    battle: {
                        ...battle,
                        winner: data.winner,
                        loser: data.loser,
                        status: 'finished'
                    }
                });
            }
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    // Ações da batalha
    joinBattle: (battleId: string) => {
        const { socket } = get();
        if (socket) {
            socket.emit('join-battle', battleId);
            console.log('🎯 Entrou na batalha:', battleId);
        }
    },

    leaveBattle: () => {
        const { socket, battle } = get();
        if (socket && battle) {
            socket.emit('leave-battle', battle.id);
            set({ battle: null });
            console.log('🚪 Saiu da batalha');
        }
    }
})); 