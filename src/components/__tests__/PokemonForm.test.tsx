import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PokemonForm from '../PokemonForm';

jest.mock('@/lib/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(() => Promise.resolve({}))
    }
}));

describe('PokemonForm', () => {
    it('renderiza os botões de tipo e permite selecionar', () => {
        render(<PokemonForm />);
        expect(screen.getByLabelText('pikachu')).toBeInTheDocument();
        expect(screen.getByLabelText('charizard')).toBeInTheDocument();
        expect(screen.getByLabelText('mewtwo')).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('charizard'));
        expect(screen.getByLabelText('charizard').className).toMatch(/ring-2/);
    });

    it('permite digitar o nome do treinador', () => {
        render(<PokemonForm />);
        const input = screen.getByPlaceholderText(/Nome do Treinador/i);
        fireEvent.change(input, { target: { value: 'Ash' } });
        expect(input).toHaveValue('Ash');
    });

    it('chama onCreated ao submeter', async () => {
        const onCreated = jest.fn();
        render(<PokemonForm onCreated={onCreated} />);
        fireEvent.click(screen.getByLabelText('pikachu'));
        fireEvent.change(screen.getByPlaceholderText(/Nome do Treinador/i), { target: { value: 'Ash' } });
        fireEvent.click(screen.getByRole('button', { name: /criar pokémon/i }));
        // Espera o submit
        await screen.findByRole('button', { name: /criar pokémon/i });
        expect(onCreated).toHaveBeenCalled();
    });
}); 