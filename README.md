# 🎮 Frontend - Pokémon Battle UI

Interface inspirada no HUD clássico dos jogos de Pokémon, desenvolvida em Next.js com Tailwind CSS para simular batalhas épicas entre Pokémons.

## 🛠️ Tecnologias

- **Next.js 14** com App Router
- **Tailwind CSS** para estilização
- **Socket.IO Client** para comunicação em tempo real
- **Framer Motion** para animações
- **React Hook Form** para formulários
- **Zustand** para gerenciamento de estado
- **TypeScript** para tipagem

## 📦 Instalação


```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

## ⚙️ Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4001

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001

# Ambiente
NODE_ENV=development
```

## 🌐 Ambiente de Produção

- **URL do Frontend:** [https://jazida.pokemon.majorssolutions.com.br](https://jazida.pokemon.majorssolutions.com.br)
- **URL da API Backend:** [https://jazida.api.majorssolutions.com.br](https://jazida.api.majorssolutions.com.br)

**Configuração recomendada para produção (.env.production ou nas variáveis da Vercel):**
```env
NEXT_PUBLIC_API_URL=https://jazida.api.majorssolutions.com.br
```

## 🚀 Executando o projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🎨 Interface e Componentes

### 🎮 Layout Principal
- **Header**: Logo e navegação
- **Sidebar**: Lista de Pokémons e controles
- **Battle Arena**: Área principal da batalha
- **HUD**: Informações em tempo real

### 🎯 Componentes Principais

#### `PokemonCard`
Exibe informações de um Pokémon individual:
- Avatar do Pokémon
- Nome do treinador
- Nível atual
- Barra de HP
- Ações (editar, deletar)

#### `BattleArena`
Simula a batalha com animações:
- Posicionamento dos Pokémons
- Efeitos visuais de ataques
- Log de batalha em tempo real
- Animações de vitória/derrota

#### `PokemonForm`
Formulário para criar/editar Pokémons:
- Seleção de tipo (Pikachu, Charizard, Mewtwo)
- Campo de treinador
- Nível inicial
- Validação em tempo real

#### `BattleControls`
Controles para iniciar batalhas:
- Seleção de dois Pokémons
- Botão de iniciar batalha
- Status da batalha atual

## 🎨 Design System

### Cores (Inspiradas no GameBoy)
```css
--gameboy-green: #9bbc0f;
--gameboy-dark-green: #306230;
--gameboy-light-green: #8bac0f;
--gameboy-very-light-green: #306230;
```

### Tipografia
- **Fonte principal**: 'Press Start 2P' (Google Fonts)
- **Fonte secundária**: 'VT323' para elementos retro

### Componentes Visuais
- **Bordas**: Estilo pixel art
- **Sombras**: Efeito de profundidade GameBoy
- **Animações**: Transições suaves com suspense

## 📱 Páginas

### `/` - Dashboard Principal
- Visão geral dos Pokémons
- Estatísticas de batalhas
- Acesso rápido às funcionalidades

### `/pokemons` - Gerenciamento
- Lista completa de Pokémons
- CRUD operations
- Filtros e busca

### `/battle` - Arena de Batalha
- Interface principal de batalha
- Seleção de Pokémons
- Simulação visual

### `/history` - Histórico
- Registro de batalhas anteriores
- Estatísticas detalhadas
- Rankings

## 🔌 Integração com Backend

### API Calls
```typescript
// Exemplo de chamada para API
const createPokemon = async (data: PokemonFormData) => {
  const response = await fetch(`${API_URL}/pokemons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### Socket.IO Events
```typescript
// Conectar ao socket
const socket = io(SOCKET_URL);

// Escutar eventos de batalha
socket.on('battle:start', (data) => {
  // Iniciar animação de batalha
});

socket.on('battle:update', (data) => {
  // Atualizar progresso da batalha
});

socket.on('battle:end', (data) => {
  // Mostrar resultado final
});
```

## 🎭 Animações e Efeitos

### Batalha
- **Entrada**: Pokémons aparecem com fade-in
- **Ataques**: Efeitos de partículas e shake
- **HP**: Barras diminuem gradualmente
- **Vitória**: Confete e celebração
- **Derrota**: Fade-out triste

### Transições
- **Páginas**: Slide transitions
- **Modais**: Fade com backdrop
- **Loading**: Spinner estilo GameBoy

## 📊 Estado da Aplicação

### Zustand Store
```typescript
interface PokemonStore {
  pokemons: Pokemon[];
  selectedPokemon: Pokemon | null;
  battleState: BattleState;
  isLoading: boolean;
  
  // Actions
  fetchPokemons: () => Promise<void>;
  createPokemon: (data: PokemonFormData) => Promise<void>;
  startBattle: (pokemon1: number, pokemon2: number) => Promise<void>;
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado sem sidebar
- **Mobile**: Layout vertical otimizado

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Deploy automático
vercel

# Deploy com preview
vercel --prod
```

### Netlify
```bash
# Build e deploy
npm run build
netlify deploy --prod --dir=out
```

## 📝 Scripts Disponíveis

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## 🎮 Funcionalidades Especiais

### Modo Nostálgico
- Filtros visuais estilo CRT
- Som de GameBoy (opcional)
- Efeitos de scanlines

### Modo Competitivo
- Rankings de treinadores
- Estatísticas detalhadas
- Conquistas e badges

### Modo Sandbox
- Batalhas infinitas
- Pokémons com níveis altos
- Modo teste para desenvolvimento

## 🔗 Links Úteis

- **Backend API**: [Documentação](./../backend/README.md)
- **Deploy**: [Vercel](https://jazida.pokemon.majorssolutions.com.br/)

---

<div align="center">

**Gotta catch 'em all!** 🎮⚡

</div>
