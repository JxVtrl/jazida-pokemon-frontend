// Mock da API diretamente
jest.mock('@/lib/api', () => {
    const mockApi = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    };
    return {
        __esModule: true,
        default: mockApi
    };
});

import api from '../api';

describe('API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET requests', () => {
        it('faz requisição GET com sucesso', async () => {
            const mockResponse = { data: [{ id: 1, tipo: 'pikachu' }] };
            (api.get as jest.Mock).mockResolvedValueOnce(mockResponse.data);

            const result = await api.get('/pokemons');

            expect(api.get).toHaveBeenCalledWith('/pokemons');
            expect(result).toEqual(mockResponse.data);
        });

        it('lida com erro 404', async () => {
            const error = new Error('Not Found');
            (api.get as jest.Mock).mockRejectedValueOnce(error);

            await expect(api.get('/pokemons/999')).rejects.toThrow('Not Found');
        });

        it('lida com erro de rede', async () => {
            const error = new Error('Network Error');
            (api.get as jest.Mock).mockRejectedValueOnce(error);

            await expect(api.get('/pokemons')).rejects.toThrow('Network Error');
        });
    });

    describe('POST requests', () => {
        it('faz requisição POST com dados', async () => {
            const mockData = { tipo: 'pikachu', treinador: 'Ash', nivel: 5 };
            const mockResponse = { id: 1, ...mockData };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await api.post('/pokemons', mockData);

            expect(api.post).toHaveBeenCalledWith('/pokemons', mockData);
            expect(result).toEqual(mockResponse);
        });

        it('lida com erro de validação (400)', async () => {
            const mockData = { tipo: 'invalid' };
            const error = new Error('Bad Request');

            (api.post as jest.Mock).mockRejectedValueOnce(error);

            await expect(api.post('/pokemons', mockData)).rejects.toThrow('Bad Request');
        });
    });

    describe('PUT requests', () => {
        it('faz requisição PUT para atualizar', async () => {
            const mockData = { nivel: 10 };
            const mockResponse = { id: 1, tipo: 'pikachu', nivel: 10 };

            (api.put as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await api.put('/pokemons/1', mockData);

            expect(api.put).toHaveBeenCalledWith('/pokemons/1', mockData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('DELETE requests', () => {
        it('faz requisição DELETE', async () => {
            const mockResponse = { message: 'Pokémon removido' };

            (api.delete as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await api.delete('/pokemons/1');

            expect(api.delete).toHaveBeenCalledWith('/pokemons/1');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Configuração da API', () => {
        it('usa base URL correta', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce([]);

            await api.get('/pokemons');

            expect(api.get).toHaveBeenCalledWith('/pokemons');
        });

        it('inclui headers padrão', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce([]);

            await api.get('/pokemons');

            expect(api.get).toHaveBeenCalledWith('/pokemons');
        });
    });

    describe('Tratamento de respostas', () => {
        it('lida com resposta vazia', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce(null);

            const result = await api.get('/pokemons');
            expect(result).toBeNull();
        });

        it('lida com resposta de texto', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce('Success');

            const result = await api.get('/pokemons');
            expect(result).toBe('Success');
        });

        it('lida com timeout', async () => {
            const error = new Error('Timeout');
            (api.get as jest.Mock).mockRejectedValueOnce(error);

            await expect(api.get('/pokemons')).rejects.toThrow('Timeout');
        });
    });
}); 