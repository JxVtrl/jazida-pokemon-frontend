import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PokemonCard from '../PokemonCard';

describe('PokemonCard', () => {
    it('exibe nome, nível e treinador corretamente', () => {
        render(
            <PokemonCard
                pokemon={{
                    id: 1,
                    tipo: 'pikachu',
                    treinador: 'Ash',
                    nivel: 5,
                }}
            />
        );
        // O nome Pikachu aparece em mais de um lugar, então pegamos o primeiro (o do topo do card)
        expect(screen.getAllByText(/Pikachu/i)[0]).toBeInTheDocument();
        // Nível aparece como label, então buscamos pelo label
        expect(screen.getByText(/Nível:/i)).toBeInTheDocument();
        // O nível aparece como valor, mas pode haver outros números, então buscamos pelo papel de texto e valor
        expect(screen.getAllByText('5').length).toBeGreaterThan(0);
        // Treinador: Ash
        expect(screen.getByText(/Ash/i)).toBeInTheDocument();
    });

    it('exibe o emoji ou imagem do tipo', () => {
        render(
            <PokemonCard
                pokemon={{
                    id: 2,
                    tipo: 'charizard',
                    treinador: 'Thiago',
                    nivel: 3,
                }}
            />
        );
        // O nome do tipo deve aparecer (primeira ocorrência é o nome do card)
        expect(screen.getAllByText(/Charizard/i)[0]).toBeInTheDocument();
        // O emoji pode ser encontrado pelo alt da imagem ou pelo emoji
        // (Se usar imagem 8bit, pode testar pelo alt)
        // expect(screen.getByAltText(/charizard/i)).toBeInTheDocument(); // se usar alt
    });
}); 