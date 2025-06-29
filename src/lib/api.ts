import axios from "axios";

// Configuração da API com fallback e logs
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

console.log("🔧 Configuração da API:");
console.log("   - NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("   - URL final:", apiUrl);
console.log("   - NODE_ENV:", process.env.NODE_ENV);

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    // Lista de rotas públicas que não precisam de token (apenas caminhos exatos)
    const publicRoutes = ["/auth/login", "/auth/register"];
    // Extrai apenas o path da URL (sem query params)
    let urlPath = config.url || "";
    if (urlPath.startsWith(apiUrl)) {
      urlPath = urlPath.replace(apiUrl, "");
    }
    if (urlPath.includes("?")) {
      urlPath = urlPath.split("?")[0];
    }
    const isPublicRoute = publicRoutes.includes(urlPath);

    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `📡 Requisição: ${config.method?.toUpperCase()} ${config.url} ${isPublicRoute ? "(rota pública)" : "(rota protegida)"}`,
    );
    return config;
  },
  (error) => {
    console.error("❌ Erro na requisição:", error);
    return Promise.reject(error);
  },
);

// Interceptor para logs de resposta
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Resposta: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ Erro na resposta:",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);

export default api;
