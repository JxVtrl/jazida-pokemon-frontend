import axios from 'axios';

// Configuração da API com fallback e logs
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

console.log('🔧 Configuração da API:');
console.log('   - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('   - URL final:', apiUrl);

const api = axios.create({
    baseURL: apiUrl,
    timeout: 10000, // 10 segundos de timeout
});

// Interceptor para logs de requisição
api.interceptors.request.use(
    (config) => {
        console.log(`📡 Requisição: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para logs de resposta
api.interceptors.response.use(
    (response) => {
        console.log(`✅ Resposta: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Erro na resposta:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api;