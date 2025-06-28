import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BattleHUD from '../BattleHUD';
import api from '@/lib/api';

// Mock da API
jest.mock('@/lib/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

describe('BattleHUD', () => {
    const mockApi = api as jest.Mocked<typeof api>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock inicial da lista de pokémons
        mockApi.get.mockResolvedValue({
            data: [
                { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 5 },
                { id: 2, tipo: 'charizard', treinador: 'Misty', nivel: 3 },
                { id: 3, tipo: 'mewtwo', treinador: 'Brock', nivel: 10 }
            ]
        });
    });

    it('renderiza o título da arena de batalha', async () => {
        render(<BattleHUD />);
        expect(screen.getByTestId('battle-title')).toBeInTheDocument();
    });

    it('carrega lista de pokémons ao montar', async () => {
        render(<BattleHUD />);
        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith('/pokemons');
        });
    });

    it('exibe botão para selecionar pokémons', async () => {
        render(<BattleHUD />);
        expect(screen.getByTestId('open-drawer-button')).toBeInTheDocument();
    });

    it('abre drawer ao clicar no botão de seleção', async () => {
        const user = userEvent.setup();
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        expect(screen.getByTestId('drawer-selector')).toBeInTheDocument();
    });

    it('permite selecionar dois pokémons diferentes', async () => {
        const user = userEvent.setup();
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await waitFor(() => expect(screen.getByTestId('drawer-selector')).toBeInTheDocument());
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await waitFor(() => {
            expect(screen.getByTestId('battle-selected-title')).toBeInTheDocument();
            expect(screen.getByTestId('pokemon-card-selected-a')).toBeInTheDocument();
            expect(screen.getByTestId('pokemon-card-selected-b')).toBeInTheDocument();
        });
    });

    it('exibe botão de batalha quando dois pokémons estão selecionados', async () => {
        const user = userEvent.setup();
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await waitFor(() => expect(screen.getByTestId('drawer-selector')).toBeInTheDocument());
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await waitFor(() => {
            expect(screen.getByTestId('battle-button')).toBeInTheDocument();
        });
    });

    it('inicia batalha ao clicar no botão', async () => {
        const user = userEvent.setup();
        mockApi.post.mockResolvedValue({
            data: {
                vencedor: { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 6 },
                perdedor: { id: 2, tipo: 'charizard', treinador: 'Misty', nivel: 2 },
                batalha: {
                    vencedor: 'pikachu',
                    perdedor: 'charizard',
                    probabilidadeVencedor: 0.7,
                    probabilidadePerdedor: 0.3
                }
            }
        });
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await waitFor(() => expect(screen.getByTestId('drawer-selector')).toBeInTheDocument());
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await waitFor(() => expect(screen.getByTestId('battle-button')).toBeInTheDocument());
        await user.click(screen.getByTestId('battle-button'));
        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/batalhar/1/2');
        }, { timeout: 4000 });
    });

    it('exibe animação de batalha durante o processo', async () => {
        const user = userEvent.setup();
        mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await user.click(screen.getByTestId('battle-button'));
        expect(screen.getByTestId('battle-animation')).toBeInTheDocument();
    });

    it('exibe resultado da batalha após conclusão', async () => {
        const user = userEvent.setup();
        mockApi.post.mockResolvedValue({
            data: {
                vencedor: { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 6 },
                perdedor: { id: 2, tipo: 'charizard', treinador: 'Misty', nivel: 2, removido: false },
                batalha: {
                    vencedor: 'pikachu',
                    perdedor: 'charizard',
                    probabilidadeVencedor: 0.7,
                    probabilidadePerdedor: 0.3
                }
            }
        });
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await waitFor(() => expect(screen.getByTestId('drawer-selector')).toBeInTheDocument());
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await waitFor(() => expect(screen.getByTestId('battle-button')).toBeInTheDocument());
        await user.click(screen.getByTestId('battle-button'));
        await waitFor(() => {
            expect(screen.getByTestId('battle-result')).toBeInTheDocument();
            expect(screen.getByTestId('battle-winner')).toBeInTheDocument();
            expect(screen.getByTestId('battle-loser')).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('exibe erro quando batalha falha', async () => {
        const user = userEvent.setup();
        mockApi.post.mockRejectedValue(new Error('Erro na batalha'));
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await waitFor(() => expect(screen.getByTestId('drawer-selector')).toBeInTheDocument());
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await waitFor(() => expect(screen.getByTestId('battle-button')).toBeInTheDocument());
        await user.click(screen.getByTestId('battle-button'));
        await waitFor(() => {
            expect(screen.getByTestId('battle-error')).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('permite remover pokémons selecionados', async () => {
        const user = userEvent.setup();
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-2'));
        await user.click(screen.getByTestId('remove-pokemon-a'));
        expect(screen.queryByTestId('battle-button')).not.toBeInTheDocument();
    });

    it('não permite selecionar o mesmo pokémon duas vezes', async () => {
        const user = userEvent.setup();
        render(<BattleHUD />);
        await user.click(screen.getByTestId('open-drawer-button'));
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        await user.click(screen.getByTestId('drawer-pokemon-1'));
        // Só um card selecionado
        expect(screen.getByTestId('pokemon-card-selected-a')).toBeInTheDocument();
        expect(screen.queryByTestId('pokemon-card-selected-b')).not.toBeInTheDocument();
    });

    it('exibe loading ao carregar pokémons', () => {
        mockApi.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<BattleHUD />);
        expect(screen.getByText(/carregando pokémons/i)).toBeInTheDocument();
    });

    it('exibe erro ao falhar carregamento de pokémons', async () => {
        mockApi.get.mockRejectedValue(new Error('Erro ao carregar'));
        render(<BattleHUD />);
        await waitFor(() => {
            expect(screen.getByTestId('battle-error')).toBeInTheDocument();
        });
    });
}); 