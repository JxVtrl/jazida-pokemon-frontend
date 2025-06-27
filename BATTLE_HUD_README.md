# 🎮 BattleHUD - Arena de Batalha Pokémon

## 📋 Descrição

O componente `BattleHUD` é uma interface interativa para realizar batalhas entre pokémons no sistema Jazida Pokémon Challenge. Ele permite selecionar dois pokémons, realizar batalhas e visualizar os resultados com animações.

## ✨ Funcionalidades

### 🎯 **Seleção de Pokémons**
- Lista todos os pokémons disponíveis via `GET /pokemons`
- Interface visual com cards clicáveis
- Seleção sequencial: primeiro pokémon A, depois pokémon B
- Validação para evitar seleção do mesmo pokémon

### ⚔️ **Sistema de Batalha**
- Botão "Batalhar" que aciona `POST /batalhar/:idA/:idB`
- Animação fake estilo Pokémon durante a batalha
- Barras de HP animadas
- Loading spinner durante o processo

### 🏆 **Resultados da Batalha**
- Exibe vencedor e perdedor com informações detalhadas
- Mostra novo nível do vencedor (nível anterior + 1)
- Indica se o perdedor foi removido (nível 0)
- Exibe probabilidades de vitória de cada pokémon
- Atualiza automaticamente a lista após a batalha

## 🎨 **Interface Visual**

### **Cores por Tipo de Pokémon**
- **Pikachu**: ⚡ Amarelo (`bg-yellow-100 border-yellow-300`)
- **Charizard**: 🔥 Vermelho (`bg-red-100 border-red-300`)
- **Mewtwo**: 🧬 Roxo (`bg-purple-100 border-purple-300`)

### **Estados Visuais**
- **Selecionado**: Ring azul e fundo azul claro
- **Vencedor**: Borda amarela e fundo amarelo claro
- **Perdedor**: Borda cinza e fundo cinza claro
- **Removido**: Borda vermelha e fundo vermelho claro

## 🔧 **Como Usar**

### **1. Acessar a Arena**
- Navegue para a aplicação
- Clique na aba "⚔️ Arena de Batalha"

### **2. Selecionar Pokémons**
- Clique no primeiro pokémon (será o Pokémon A)
- Clique no segundo pokémon (será o Pokémon B)
- Os pokémons selecionados aparecem na seção "Pokémons Selecionados"

### **3. Iniciar Batalha**
- Clique no botão "⚔️ Batalhar!"
- Aguarde a animação de batalha (2 segundos)
- Visualize o resultado

### **4. Ver Resultado**
- **Vencedor**: Mostra novo nível e troféu 🏆
- **Perdedor**: Mostra novo nível ou "Foi Derrotado! 💀"
- **Probabilidades**: Exibe as chances de vitória de cada um

## 📱 **Responsividade**

O componente é totalmente responsivo:
- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2 colunas para pokémons
- **Desktop**: Grid 3 colunas para pokémons

## 🛠️ **Tecnologias Utilizadas**

- **React**: Hooks (useState, useEffect)
- **TypeScript**: Tipagem forte
- **Tailwind CSS**: Estilização
- **Axios**: Requisições HTTP
- **Shadcn/ui**: Componentes UI

## 🔄 **Fluxo de Dados**

```
1. useEffect → fetchPokemons()
2. GET /pokemons → setPokemons()
3. Seleção → setSelectedPokemonA/B()
4. Batalha → POST /batalhar/:idA/:idB
5. Resultado → setBattleResult()
6. Atualização → fetchPokemons() (nova lista)
```

## 🎯 **Estados do Componente**

```typescript
interface BattleHUDState {
  pokemons: Pokemon[];           // Lista de pokémons
  selectedPokemonA: Pokemon | null;  // Primeiro selecionado
  selectedPokemonB: Pokemon | null;  // Segundo selecionado
  isLoading: boolean;            // Loading inicial
  isBattling: boolean;           // Animação de batalha
  battleResult: BattleResult | null;  // Resultado da batalha
  error: string | null;          // Mensagens de erro
}
```

## 🚀 **Exemplo de Uso**

```tsx
import BattleHUD from '@/components/BattleHUD';

function App() {
  return (
    <div>
      <BattleHUD />
    </div>
  );
}
```

## 🐛 **Tratamento de Erros**

- **Erro de carregamento**: "Erro ao carregar pokémons"
- **Pokémons não selecionados**: "Selecione dois pokémons para batalhar"
- **Mesmo pokémon**: "Não é possível batalhar um pokémon contra ele mesmo"
- **Erro de batalha**: Mensagem específica da API

## 🎨 **Animações**

- **Hover**: Scale 105% nos cards
- **Loading**: Spinner girando
- **Batalha**: Barras de HP pulsando
- **VS**: Ícone saltando
- **Transições**: Suaves entre estados

## 📊 **Estrutura da Resposta da API**

```typescript
interface BattleResult {
  vencedor: Pokemon & { nivel: number };
  perdedor: Pokemon & { nivel: number; removido?: boolean };
  batalha: {
    vencedor: string;
    perdedor: string;
    probabilidadeVencedor: number;
    probabilidadePerdedor: number;
  };
}
```

---

**Desenvolvido para o Jazida Pokémon Challenge** 🎮 