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

---

## 🧪 Testes

O frontend possui **testes unitários, de integração e E2E** cobrindo toda a interface e lógica de interação.

### **Testes Unitários**
- Cobrem componentes isolados (`PokemonCard`, `PokemonForm`, `BattleHUD` etc)
- Cobrem funções utilitárias e API
- Executados com **Jest** e **Testing Library**

```bash
npm test
```

### **Testes de Integração**
- Simulam fluxos completos de cadastro, edição, remoção e navegação entre abas
- Mockam a API para garantir isolamento dos fluxos
- Arquivo principal: `src/__tests__/integration/PokemonFlow.test.tsx`

### **Testes E2E (End-to-End)**
- Simulam o uso real da aplicação no navegador
- Testam cadastro, listagem, batalha, responsividade, validação e loading
- Executados com **Playwright**

```bash
npm run test:e2e
```

- Os testes E2E estão em `frontend/e2e/pokemon-flow.spec.ts`
- Para rodar localmente, garanta que o backend esteja rodando e a aplicação acessível em `http://localhost:5173`

---

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

---

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado sem sidebar
- **Mobile**: Layout vertical otimizado

---

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
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test e2e/"
}
```

---

## 🔗 Links Úteis

- **Backend API**: [Documentação](./../backend/README.md)
- **Deploy**: [Vercel](https://jazida.pokemon.majorssolutions.com.br/)

---

<div align="center">

**Gotta catch 'em all!** 🎮⚡

</div>
