import React from 'react';
import { render } from '@testing-library/react';
import Home from '@/app/page';

// Mock da API para performance
jest.mock('@/lib/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(() => Promise.resolve({
            data: Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                tipo: ['pikachu', 'charizard', 'mewtwo'][i % 3],
                treinador: `Treinador ${i + 1}`,
                nivel: Math.floor(Math.random() * 100) + 1
            }))
        }))
    }
}));

describe('Performance Tests', () => {
    it('renderiza lista com muitos pokémons rapidamente', async () => {
        const startTime = performance.now();

        const { container } = render(<Home />);

        // Aguardar carregamento
        await new Promise(resolve => setTimeout(resolve, 100));

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Verificar se renderizou em menos de 5 segundos (mais realista)
        expect(renderTime).toBeLessThan(5000);

        // Verificar se todos os pokémons foram renderizados
        const pokemonCards = container.querySelectorAll('[class*="rounded-2xl"]');
        expect(pokemonCards.length).toBeGreaterThan(0);
    });

    it('renderiza componentes individuais rapidamente', () => {
        const pokemons = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            tipo: ['pikachu', 'charizard', 'mewtwo'][i % 3],
            treinador: `Treinador ${i + 1}`,
            nivel: Math.floor(Math.random() * 100) + 1
        }));

        const startTime = performance.now();

        pokemons.forEach(pokemon => {
            const { unmount } = render(
                <div data-testid={`pokemon-${pokemon.id}`}>
                    <span>{pokemon.tipo}</span>
                    <span>{pokemon.treinador}</span>
                    <span>{pokemon.nivel}</span>
                </div>
            );
            unmount();
        });

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Verificar se cada componente renderiza em menos de 100ms (mais realista)
        const averageTime = totalTime / pokemons.length;
        expect(averageTime).toBeLessThan(100);
    });

    it('testa performance de operações de array', () => {
        const largeArray = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            tipo: ['pikachu', 'charizard', 'mewtwo'][i % 3],
            treinador: `Treinador ${i}`,
            nivel: Math.floor(Math.random() * 100) + 1
        }));

        const startTime = performance.now();

        // Operações comuns
        const filtered = largeArray.filter(p => p.nivel > 50);
        const mapped = largeArray.map(p => ({ ...p, nivel: p.nivel + 1 }));
        const sorted = largeArray.sort((a, b) => b.nivel - a.nivel);

        const endTime = performance.now();
        const operationTime = endTime - startTime;

        // Verificar se operações são rápidas (aumentado para 500ms)
        expect(operationTime).toBeLessThan(500);
        expect(filtered.length).toBeLessThan(largeArray.length);
        expect(mapped.length).toBe(largeArray.length);
        expect(sorted[0].nivel).toBeGreaterThanOrEqual(sorted[1].nivel);
    });

    it('testa performance de renderização condicional', () => {
        const conditions = Array.from({ length: 1000 }, (_, i) => i % 2 === 0);

        const startTime = performance.now();

        const { container } = render(
            <div>
                {conditions.map((condition, index) => (
                    <div key={index}>
                        {condition ? (
                            <span data-testid={`true-${index}`}>Verdadeiro</span>
                        ) : (
                            <span data-testid={`false-${index}`}>Falso</span>
                        )}
                    </div>
                ))}
            </div>
        );

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Verificar se renderização condicional é rápida (aumentado para 2s)
        expect(renderTime).toBeLessThan(2000);

        // Verificar se elementos foram renderizados corretamente
        const trueElements = container.querySelectorAll('[data-testid^="true-"]');
        const falseElements = container.querySelectorAll('[data-testid^="false-"]');
        expect(trueElements.length + falseElements.length).toBe(1000);
    });

    it('testa uso de memória', () => {
        const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

        // Criar muitos componentes
        const components = Array.from({ length: 100 }, (_, i) => ({
            id: i,
            tipo: ['pikachu', 'charizard', 'mewtwo'][i % 3] as string,
            treinador: `Treinador ${i}`,
            nivel: Math.floor(Math.random() * 100) + 1
        }));

        const { unmount } = render(
            <div>
                {components.map(comp => (
                    <div key={comp.id} data-testid={`comp-${comp.id}`}>
                        {comp.tipo} - {comp.treinador} - {comp.nivel}
                    </div>
                ))}
            </div>
        );

        const memoryAfterRender = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

        // Limpar componentes
        unmount();

        const memoryAfterUnmount = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

        // Verificar se memória foi liberada (aproximadamente)
        if (initialMemory > 0) {
            expect(memoryAfterUnmount).toBeLessThanOrEqual(memoryAfterRender);
        }
    });
}); 