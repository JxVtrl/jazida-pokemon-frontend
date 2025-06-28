# 🧪 Guia de Testes - Jazida Pokémon

Este documento descreve a suíte completa de testes do projeto, incluindo testes unitários, de integração, E2E e de performance.

## 📋 Estrutura de Testes

```
src/
├── components/__tests__/          # Testes unitários de componentes
│   ├── PokemonCard.test.tsx
│   ├── PokemonCard.snapshot.test.tsx
│   ├── PokemonForm.test.tsx
│   └── BattleHUD.test.tsx
├── lib/__tests__/                 # Testes de utilitários e API
│   ├── utils.test.ts
│   └── api.test.ts
├── __tests__/                     # Testes de integração
│   ├── integration/
│   │   └── PokemonFlow.test.tsx
│   └── performance/
│       └── performance.test.tsx
e2e/                               # Testes E2E com Playwright
├── pokemon-flow.spec.ts
├── battle-flow.spec.ts
└── complete-flow.spec.ts
```

## 🚀 Scripts de Teste

### Testes Unitários
```bash
# Executar todos os testes unitários
npm test

# Executar em modo watch
npm run test:watch

# Executar testes específicos
npm run test:unit          # Apenas componentes
npm run test:utils         # Apenas utilitários
npm run test:performance   # Apenas performance
```

### Testes de Integração
```bash
# Executar testes de integração
npm run test:integration
```

### Testes E2E
```bash
# Executar testes E2E
npm run test:e2e

# Executar com navegador visível
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug
```

### Cobertura de Código
```bash
# Cobertura básica
npm run test:coverage

# Cobertura detalhada com thresholds
npm run test:coverage:detailed
```

### CI/CD
```bash
# Executar todos os testes para CI
npm run test:ci

# Executar todos os testes (unitários + E2E)
npm run test:all
```

## 🎯 Tipos de Teste

### 1. Testes Unitários

Testam componentes e funções isoladamente:

#### Componentes
- **PokemonCard**: Renderização, props, estilos
- **PokemonForm**: Validação, submissão, estados
- **BattleHUD**: Seleção, batalha, resultados

#### Utilitários
- **utils.ts**: Formatação, validação, cálculos
- **api.ts**: Requisições HTTP, tratamento de erros

### 2. Testes de Integração

Testam fluxos completos da aplicação:

- **PokemonFlow**: Cadastro → Listagem → Navegação
- **BattleFlow**: Seleção → Batalha → Resultado
- **ErrorHandling**: Tratamento de erros end-to-end

### 3. Testes E2E

Testam a aplicação completa no navegador:

- **Fluxo Completo**: Cadastro → Batalha → Verificação
- **Responsividade**: Testes em diferentes viewports
- **Performance**: Tempos de carregamento e renderização

### 4. Testes de Performance

Verificam performance e otimizações:

- **Renderização**: Tempo de renderização de componentes
- **Operações**: Performance de arrays e objetos
- **Memória**: Uso e liberação de memória

### 5. Testes de Snapshot

Capturam mudanças visuais:

- **PokemonCard**: Diferentes tipos e estados
- **Responsividade**: Diferentes tamanhos de tela

## 📊 Cobertura de Código

### Thresholds (Mínimos)
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Relatórios
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info`

## 🛠️ Configuração

### Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Playwright
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173'
  }
});
```

## 🧪 Boas Práticas

### 1. Nomenclatura
```typescript
// ✅ Bom
describe('PokemonCard', () => {
  it('renderiza pokémon corretamente', () => {
    // teste
  });
});

// ❌ Ruim
describe('Component', () => {
  it('test', () => {
    // teste
  });
});
```

### 2. Organização
```typescript
describe('PokemonForm', () => {
  // Setup
  beforeEach(() => {
    // configuração
  });

  // Testes de renderização
  describe('renderização', () => {
    it('renderiza campos obrigatórios', () => {
      // teste
    });
  });

  // Testes de interação
  describe('interação', () => {
    it('submete formulário com dados válidos', () => {
      // teste
    });
  });

  // Testes de erro
  describe('tratamento de erro', () => {
    it('exibe erro quando API falha', () => {
      // teste
    });
  });
});
```

### 3. Mocks
```typescript
// Mock de API
jest.mock('@/lib/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

// Mock de módulos
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/'
  })
}));
```

### 4. Assertions
```typescript
// ✅ Específico
expect(screen.getByText('Pikachu')).toBeInTheDocument();
expect(button).toBeDisabled();

// ❌ Genérico
expect(element).toBeTruthy();
```

## 🔧 Debugging

### Jest
```bash
# Debug com console.log
npm test -- --verbose

# Debug com debugger
npm test -- --runInBand --no-cache
```

### Playwright
```bash
# Debug visual
npm run test:e2e:headed

# Debug com breakpoints
npm run test:e2e:debug
```

### Coverage
```bash
# Ver relatório HTML
open coverage/lcov-report/index.html
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Testes falhando por timeout**
   ```bash
   # Aumentar timeout
   jest.setTimeout(10000);
   ```

2. **Mocks não funcionando**
   ```typescript
   // Limpar mocks entre testes
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Testes E2E falhando**
   ```bash
   # Verificar se backend está rodando
   docker-compose up backend
   
   # Verificar se frontend está rodando
   npm run dev
   ```

4. **Cobertura baixa**
   ```bash
   # Verificar arquivos excluídos
   npm run test:coverage:detailed
   ```

## 📈 Métricas

### Performance
- **Renderização**: < 1s para 100 componentes
- **Interação**: < 100ms para cliques
- **Memória**: Liberação após unmount

### Confiabilidade
- **Flaky Tests**: < 1%
- **Timeout**: < 5s por teste
- **Cobertura**: > 80%

## 🔄 CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:e2e
```

### Pre-commit Hooks
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npm test",
      "npm run lint"
    ]
  }
}
```

---

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

<div align="center">

**Gotta test 'em all!** 🧪⚡

</div> 