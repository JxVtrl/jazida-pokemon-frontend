import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import api from '@/lib/api';

// Estado global dos pokémons
let mockPokemons: Array<{
    id: number;
    tipo: string;
    treinador: string;
    nivel: number;
}> = [];

jest.mock('@/lib/api', () => {
    return {
        __esModule: true,
        default: {
            get: jest.fn(() => Promise.resolve({ data: [...mockPokemons] })),
            post: jest.fn((url: string, data: { tipo: string; treinador: string; nivel?: number }) => {
                const newPokemon = { id: mockPokemons.length + 1, ...data };
                mockPokemons.push(newPokemon);
                return Promise.resolve({ data: newPokemon });
            }),
            put: jest.fn((url: string, data: { tipo?: string; treinador?: string; nivel?: number }) => {
                const id = parseInt(url.split('/').pop()!);
                const index = mockPokemons.findIndex(p => p.id === id);
                if (index !== -1) {
                    mockPokemons[index] = { ...mockPokemons[index], ...data };
                }
                return Promise.resolve({ data: mockPokemons[index] });
            }),
            delete: jest.fn((url: string) => {
                const id = parseInt(url.split('/').pop()!);
                mockPokemons = mockPokemons.filter(p => p.id !== id);
                return Promise.resolve({ data: { message: 'Pokémon removido' } });
            })
        }
    };
});

describe('Fluxo completo de gerenciamento de pokémons', () => {
    const user = userEvent.setup();
    const mockApi = api as jest.Mocked<typeof api>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPokemons = [
            { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 1 },
            { id: 2, tipo: 'charizard', treinador: 'Thiago', nivel: 1 },
        ];
    });

    it('exibe lista inicial de pokémons', async () => {
        render(<Home />);
        
        // Aguardar pelo botão de adicionar (indica que a tela carregou)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /\+ adicionar pokémon/i })).toBeInTheDocument();
        }, { timeout: 10000 });
        
        // Aguardar pelos cards de pokémon
        await waitFor(() => {
            const cards = screen.getAllByTestId('pokemon-card');
            expect(cards.length).toBe(2);
        }, { timeout: 15000 });
    }, 20000);

    it('permite cadastrar novo pokémon', async () => {
        render(<Home />);
        
        // Aguardar carregamento inicial
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /\+ adicionar pokémon/i })).toBeInTheDocument();
        }, { timeout: 10000 });
        
        // Abrir drawer e preencher formulário
        await user.click(screen.getByRole('button', { name: /\+ adicionar pokémon/i }));
        
        // Aguardar drawer abrir
        await waitFor(() => {
            expect(screen.getByText(/adicionar novo pokémon/i)).toBeInTheDocument();
        }, { timeout: 5000 });
        
        // Preencher formulário
        await user.click(screen.getByLabelText('mewtwo'));
        await user.type(screen.getByLabelText(/treinador/i), 'Brock');
        
        // Aguardar um pouco para garantir que o formulário foi preenchido
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Clicar no botão de criar
        const criarButton = screen.getByRole('button', { name: /criar pokémon/i });
        await user.click(criarButton);
        
        // Verificar se a API foi chamada (isso é mais confiável que verificar o drawer)
        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/pokemons', {
                tipo: 'mewtwo',
                treinador: 'Brock',
                nivel: 1
            });
        }, { timeout: 10000 });
    }, 20000);

    it('navega entre abas', async () => {
        render(<Home />);
        
        // Aguardar carregamento inicial
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /\+ adicionar pokémon/i })).toBeInTheDocument();
        }, { timeout: 10000 });
        
        // Navegar para arena de batalha
        await user.click(screen.getByText(/arena de batalha/i));
        expect(screen.getByText(/arena de batalha pokémon/i)).toBeInTheDocument();
        
        // Voltar para lista
        await user.click(screen.getByText(/lista de pokémons/i));
        expect(screen.getByRole('button', { name: /\+ adicionar pokémon/i })).toBeInTheDocument();
    }, 20000);
}); 