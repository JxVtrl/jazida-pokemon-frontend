import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/lib/api', () => {
    let pokemons = [
        { id: 1, tipo: 'pikachu', treinador: 'Ash', nivel: 1 },
        { id: 2, tipo: 'charizard', treinador: 'Thiago', nivel: 1 },
    ];
    return {
        __esModule: true,
        default: {
            get: jest.fn(() => Promise.resolve({ data: pokemons })),
            post: jest.fn((url, data) => {
                if (url === '/pokemons') {
                    const novo = { ...data, id: pokemons.length + 1, nivel: 1 };
                    pokemons.push(novo);
                    return Promise.resolve({ data: novo });
                }
                return Promise.resolve({});
            })
        }
    };
});

describe('Fluxo de cadastro e listagem de pokémons', () => {
    it('cadastra um novo pokémon e exibe na lista', async () => {
        render(<Home />);
        // Abrir drawer do formulário
        fireEvent.click(screen.getByRole('button', { name: /adicionar pokémon/i }));
        // Selecionar tipo
        fireEvent.click(screen.getByLabelText('mewtwo'));
        // Preencher treinador
        fireEvent.change(screen.getByPlaceholderText(/Nome do Treinador/i), { target: { value: 'Giovanni' } });
        // Submeter
        fireEvent.click(screen.getByRole('button', { name: /criar pokémon/i }));
        // Esperar o pokémon aparecer na lista
        await waitFor(() => {
            // Deve haver pelo menos um card com o nome Mewtwo
            expect(screen.getAllByText(/Mewtwo/i).length).toBeGreaterThan(0);
            expect(screen.getByText(/Giovanni/i)).toBeInTheDocument();
        });
    });
}); 