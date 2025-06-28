import React from 'react';
import { render } from '@testing-library/react';
import PokemonCard from '../PokemonCard';

describe('PokemonCard Snapshot Tests', () => {
    it('renderiza Pikachu corretamente', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 1,
                    tipo: 'pikachu',
                    treinador: 'Ash',
                    nivel: 5,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza Charizard corretamente', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 2,
                    tipo: 'charizard',
                    treinador: 'Misty',
                    nivel: 10,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza Mewtwo corretamente', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 3,
                    tipo: 'mewtwo',
                    treinador: 'Brock',
                    nivel: 15,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza pokémon com nível alto', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 4,
                    tipo: 'pikachu',
                    treinador: 'Treinador Experiente',
                    nivel: 99,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza pokémon com nome longo de treinador', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 5,
                    tipo: 'charizard',
                    treinador: 'Treinador com Nome Muito Longo para Testar Quebra de Linha',
                    nivel: 1,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza pokémon com nível zero', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 6,
                    tipo: 'mewtwo',
                    treinador: 'Novato',
                    nivel: 0,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });

    it('renderiza pokémon com tipo inválido', () => {
        const { container } = render(
            <PokemonCard
                pokemon={{
                    id: 7,
                    tipo: 'invalid',
                    treinador: 'Teste',
                    nivel: 1,
                }}
            />
        );

        expect(container.firstChild).toMatchSnapshot();
    });
}); 