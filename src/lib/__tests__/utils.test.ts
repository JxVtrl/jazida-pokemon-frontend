import { formatPokemonName, calculateBattleProbability, validatePokemonData } from '../utils';

describe('Utils', () => {
    describe('formatPokemonName', () => {
        it('capitaliza primeira letra', () => {
            expect(formatPokemonName('pikachu')).toBe('Pikachu');
            expect(formatPokemonName('charizard')).toBe('Charizard');
            expect(formatPokemonName('mewtwo')).toBe('Mewtwo');
        });

        it('lida com strings vazias', () => {
            expect(formatPokemonName('')).toBe('');
        });

        it('lida com strings já capitalizadas', () => {
            expect(formatPokemonName('Pikachu')).toBe('Pikachu');
        });
    });

    describe('calculateBattleProbability', () => {
        it('calcula probabilidade baseada no nível', () => {
            const result = calculateBattleProbability(10, 5);
            expect(result).toBeGreaterThan(0.5); // Nível maior tem vantagem
        });

        it('retorna 0.5 para níveis iguais', () => {
            const result = calculateBattleProbability(5, 5);
            expect(result).toBe(0.5);
        });

        it('lida com nível zero', () => {
            const result = calculateBattleProbability(0, 10);
            expect(result).toBe(0.1); // Valor fixo para nível zero
        });

        it('lida com níveis negativos', () => {
            const result = calculateBattleProbability(-5, 10);
            expect(result).toBe(0.1); // Valor fixo para níveis negativos
        });
    });

    describe('validatePokemonData', () => {
        it('valida dados corretos', () => {
            const validData = {
                tipo: 'pikachu',
                treinador: 'Ash',
                nivel: 5
            };

            const result = validatePokemonData(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('rejeita tipo inválido', () => {
            const invalidData = {
                tipo: 'invalid',
                treinador: 'Ash',
                nivel: 5
            };

            const result = validatePokemonData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Tipo inválido');
        });

        it('rejeita treinador vazio', () => {
            const invalidData = {
                tipo: 'pikachu',
                treinador: '',
                nivel: 5
            };

            const result = validatePokemonData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Treinador é obrigatório');
        });

        it('rejeita nível negativo', () => {
            const invalidData = {
                tipo: 'pikachu',
                treinador: 'Ash',
                nivel: -1
            };

            const result = validatePokemonData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Nível deve ser positivo');
        });

        it('rejeita nível muito alto', () => {
            const invalidData = {
                tipo: 'pikachu',
                treinador: 'Ash',
                nivel: 101
            };

            const result = validatePokemonData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Nível máximo é 100');
        });

        it('acumula múltiplos erros', () => {
            const invalidData = {
                tipo: 'invalid',
                treinador: '',
                nivel: -5
            };

            const result = validatePokemonData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
}); 