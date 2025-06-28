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
            console.log('🔄 Buscando pokémons do treinador...');
            const response = await api.get('/me/pokemons');
            console.log('📦 Pokémons do treinador recebidos:', response.data);
            set({ myPokemons: response.data || [] });
        } catch (error) {
            console.error('❌ Erro ao buscar pokémons do treinador:', error);
            console.error('❌ Detalhes do erro:', error.response?.data);
            set({ myPokemons: [] });
        }
    },

    // Socket management
    connectSocket: () => {
        const { trainer } = get();
        if (!trainer || get().socket) return;

        console.log('🔗 Conectando socket para treinador:', trainer.id, trainer.nome);

        const socket = io(api.defaults.baseURL!, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('🔗 Socket conectado, registrando treinador:', trainer.id);
            socket.emit('register', trainer.id);
            socket.emit('join-trainer-room', trainer.id);
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

        socket.on('battle:round', (data: {
            round: number;
            pokemonA: BattlePokemon;
            pokemonB: BattlePokemon;
            atacantePrimeiro: 'A' | 'B';
            danoA: number;
            danoB: number;
        }) => {
            console.log('🥊 Round da batalha recebido:', data);
            console.log(`🥊 Round ${data.round}: ${data.atacantePrimeiro} atacou primeiro`);
            console.log(`🥊 Dano A: ${data.danoA}, Dano B: ${data.danoB}`);
            console.log(`🥊 Vida A: ${data.pokemonA.vida}, Vida B: ${data.pokemonB.vida}`);
            
            const { battle } = get();
            if (battle) {
                const newBattle = {
                    ...battle,
                    pokemonA: data.pokemonA,
                    pokemonB: data.pokemonB,
                    round: data.round,
                    status: 'fighting'
                };
                console.log('🥊 Atualizando estado da batalha:', newBattle);
                set({ battle: newBattle });
            } else {
                console.error('🥊 Erro: battle state não encontrado');
            }
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
            rounds: number;
        }) => {
            console.log('🏆 Batalha finalizada:', data);
            const { battle, trainer } = get();
            if (battle) {
                set({
                    battle: {
                        ...battle,
                        winner: data.winner,
                        loser: data.loser,
                        status: 'finished'
                    }
                });

                // CORREÇÃO: Determinar qual pokémon é do treinador atual
                // pokemonA sempre é do primeiro treinador, pokemonB do segundo
                const myPokemon = battle.pokemonA.treinador === trainer?.id ? battle.pokemonA : battle.pokemonB;
                const isWinner = data.winner.id === myPokemon.id;
                const isLoser = data.loser.id === myPokemon.id;
                
                let result: 'victory' | 'defeat' | 'death';
                if (isWinner) {
                    result = 'victory';
                } else if (isLoser && data.loser.nivel <= 0) {
                    result = 'death';
                } else {
                    result = 'defeat';
                }

                // Calcular nível anterior
                let nivelAnterior = myPokemon.nivel;
                if (isWinner) {
                    nivelAnterior = myPokemon.nivel - 1;
                } else if (isLoser) {
                    nivelAnterior = myPokemon.nivel + 1;
                }

                const battleResult = {
                    pokemon: {
                        ...myPokemon,
                        nivelAnterior
                    },
                    result
                };

                localStorage.setItem('battleResult', JSON.stringify(battleResult));

                // Redirecionar para home após 3 segundos
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/';
                    }
                }, 3000);
            }
        });

        // Evento quando desafio é aceito
        socket.on('battle-accepted', (data: {
            battleId: string;
            trainerAId: number;
            trainerBId: number;
            acceptedBy: number;
        }) => {
            console.log('✅ Desafio aceito:', data);
            // Redirecionar para a página de batalha
            if (typeof window !== 'undefined') {
                window.location.href = `/batalha/${data.battleId}`;
            }
        });

        // Evento quando outro treinador sai da batalha
        socket.on('battle-player-left', (data: {
            battleId: string;
            trainerId: number;
            message: string;
        }) => {
            console.log('🚪 Outro treinador saiu da batalha:', data);
            // Mostrar alerta e redirecionar para home
            if (typeof window !== 'undefined') {
                window.location.href = '/';
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
        const { socket, trainer } = get();
        if (!socket || !trainer) {
            console.log('⚠️ Socket ou trainer não disponível para entrar na batalha');
            return;
        }
        
        if (!socket.connected) {
            console.log('⚠️ Socket não conectado, aguardando conexão...');
            socket.once('connect', () => {
                console.log('🔗 Socket conectado, agora entrando na batalha:', battleId);
                socket.emit('join-battle', battleId);
            });
            return;
        }
        
        socket.emit('join-battle', battleId);
        console.log('🎯 Entrou na batalha:', battleId);
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