import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PokemonForm from '../PokemonForm';
import api from '@/lib/api';

// Mock da API
jest.mock('@/lib/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn()
    }
}));

describe('PokemonForm', () => {
    const mockOnCreated = jest.fn();
    const mockPost = (api as jest.Mocked<typeof api>).post;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza todos os campos do formulário', () => {
        render(<PokemonForm onCreated={mockOnCreated} />);

        expect(screen.getByLabelText('pikachu')).toBeInTheDocument();
        expect(screen.getByLabelText('charizard')).toBeInTheDocument();
        expect(screen.getByLabelText('mewtwo')).toBeInTheDocument();
        expect(screen.getByLabelText(/treinador/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /criar pokémon/i })).toBeInTheDocument();
    });

    it('permite selecionar tipo de pokémon', async () => {
        const user = userEvent.setup();
        render(<PokemonForm onCreated={mockOnCreated} />);

        const charizardButton = screen.getByLabelText('charizard');
        await user.click(charizardButton);

        // Verificar se o botão está selecionado (tem a classe de seleção)
        expect(charizardButton).toHaveClass('border-blue-600');
    });

    it('permite digitar nome do treinador', async () => {
        const user = userEvent.setup();
        render(<PokemonForm onCreated={mockOnCreated} />);

        const treinadorInput = screen.getByLabelText(/treinador/i);
        await user.type(treinadorInput, 'Ash Ketchum');

        expect(treinadorInput).toHaveValue('Ash Ketchum');
    });

    it('submete formulário com dados corretos', async () => {
        const user = userEvent.setup();
        mockPost.mockResolvedValueOnce({ data: { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 1 } });

        render(<PokemonForm onCreated={mockOnCreated} />);

        // Preencher formulário
        await user.click(screen.getByLabelText('pikachu'));
        await user.type(screen.getByLabelText(/treinador/i), 'Ash');

        // Submeter
        await user.click(screen.getByRole('button', { name: /criar pokémon/i }));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/pokemons', {
                tipo: 'pikachu',
                treinador: 'Ash',
                nivel: 1
            });
        });

        expect(mockOnCreated).toHaveBeenCalled();
    });

    it('exibe loading durante submissão', async () => {
        const user = userEvent.setup();
        mockPost.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(<PokemonForm onCreated={mockOnCreated} />);

        // Preencher e submeter
        await user.click(screen.getByLabelText('pikachu'));
        await user.type(screen.getByLabelText(/treinador/i), 'Ash');
        await user.click(screen.getByRole('button', { name: /criar pokémon/i }));

        expect(screen.getByRole('button', { name: /criando/i })).toBeDisabled();
    });

    it('exibe erro quando API falha', async () => {
        const user = userEvent.setup();
        const error = new Error('Erro de rede');
        mockPost.mockRejectedValueOnce(error);

        render(<PokemonForm onCreated={mockOnCreated} />);

        // Preencher e submeter
        await user.click(screen.getByLabelText('pikachu'));
        await user.type(screen.getByLabelText(/treinador/i), 'Ash');
        await user.click(screen.getByRole('button', { name: /criar pokémon/i }));

        // Aguardar erro aparecer
        await waitFor(() => {
            expect(screen.getByText(/erro/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        // Verificar que a API foi chamada
        expect(mockPost).toHaveBeenCalledWith('/pokemons', {
            tipo: 'pikachu',
            treinador: 'Ash',
            nivel: 1
        });
    }, 10000);

    it('valida campos obrigatórios', async () => {
        const user = userEvent.setup();
        render(<PokemonForm onCreated={mockOnCreated} />);

        // Tentar submeter sem preencher
        await user.click(screen.getByRole('button', { name: /criar pokémon/i }));

        expect(mockPost).not.toHaveBeenCalled();
        expect(mockOnCreated).not.toHaveBeenCalled();
    });

    it('limpa formulário após sucesso', async () => {
        const user = userEvent.setup();
        mockPost.mockResolvedValueOnce({ data: { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 1 } });

        render(<PokemonForm onCreated={mockOnCreated} />);

        // Preencher formulário
        await user.click(screen.getByLabelText('pikachu'));
        await user.type(screen.getByLabelText(/treinador/i), 'Ash');

        // Submeter
        await user.click(screen.getByRole('button', { name: /criar pokémon/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/treinador/i)).toHaveValue('');
        });
    });
}); 