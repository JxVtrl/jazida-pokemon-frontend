import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BattleResultModal from "../BattleResultModal";

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}));

// Mock do battleStore
const mockBattleStore = {
  battle: null,
  setBattle: jest.fn(),
};

jest.mock("@/store/battleStore", () => ({
  useBattleStore: () => mockBattleStore,
}));

// Mock do AuthContext
const mockAuthContext = {
  user: null,
  token: null,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  isAuthenticated: false,
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock do getPokemonGifByLevel
jest.mock("@/utils/getPokemonGifByLevel", () => ({
  getPokemonGifByLevel: jest.fn(() => "/test-image.webp"),
}));

describe("BattleResultModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset dos mocks para estado inicial
    mockBattleStore.battle = null;
    mockAuthContext.user = null;
  });

  it("não deve renderizar quando battle.status não é 'finished'", () => {
    mockBattleStore.battle = {
      id: "test-battle",
      status: "fighting",
      pokemonA: null,
      pokemonB: null,
      winner: null,
      loser: null,
      round: 1,
    };

    render(<BattleResultModal />);

    expect(screen.queryByText("🎉 Vitória!")).not.toBeInTheDocument();
    expect(screen.queryByText("😔 Derrota")).not.toBeInTheDocument();
  });

  it("deve renderizar modal de vitória corretamente", () => {
    mockAuthContext.user = { id: 1, nome: "Ash" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1, // Usuário atual é o vencedor
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    // Como o usuário é o vencedor, deve mostrar "Batalha Finalizada" (default)
    expect(screen.getByText("Batalha Finalizada")).toBeInTheDocument();
    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getAllByText("Lv.25")).toHaveLength(2); // Nível anterior e atual
  });

  it("deve renderizar modal de derrota corretamente", () => {
    mockAuthContext.user = { id: 2, nome: "Gary" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2, // Usuário atual é o perdedor
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    // Como o usuário é o perdedor, deve mostrar "Batalha Finalizada" (default)
    expect(screen.getByText("Batalha Finalizada")).toBeInTheDocument();
    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getAllByText("Lv.20")).toHaveLength(2); // Nível anterior e atual
  });

  it("deve mostrar animação de morte quando pokémon tem nível 0", () => {
    mockAuthContext.user = { id: 2, nome: "Gary" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 0, // Pokémon morto
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 0,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    expect(screen.getByText("💀")).toBeInTheDocument();
    expect(
      screen.getByText("Pokémon não sobreviveu à batalha"),
    ).toBeInTheDocument();
  });

  it("deve mostrar animação de vitória quando nível aumentou", () => {
    mockAuthContext.user = { id: 1, nome: "Ash" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25, // Nível anterior
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 26, // Nível aumentou
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    expect(screen.getByText("⭐")).toBeInTheDocument();
    expect(screen.getByText("Nível aumentou!")).toBeInTheDocument();
  });

  it("deve mostrar mudança de nível corretamente", () => {
    mockAuthContext.user = { id: 1, nome: "Ash" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25, // Nível anterior
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 26, // Nível aumentou
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    expect(screen.getByText("Lv.25")).toBeInTheDocument(); // Nível anterior
    expect(screen.getByText("Lv.26")).toBeInTheDocument(); // Nível atual
    expect(screen.getByText("+1")).toBeInTheDocument(); // Mudança de nível
  });

  it("deve mostrar imagem do pokémon corretamente", () => {
    mockAuthContext.user = { id: 1, nome: "Ash" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    const image = screen.getByAltText("pikachu");
    expect(image).toBeInTheDocument();
    // Next.js Image component adiciona parâmetros à URL
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("test-image.webp"),
    );
  });

  it("deve navegar para home ao clicar em fechar", () => {
    mockAuthContext.user = { id: 1, nome: "Ash" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    const closeButton = screen.getByText("Fechar");
    fireEvent.click(closeButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("deve lidar com pokémon do treinador B corretamente", () => {
    mockAuthContext.user = { id: 2, nome: "Gary" };
    mockBattleStore.battle = {
      id: "test-battle",
      status: "finished",
      pokemonA: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      pokemonB: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      winner: {
        id: 1,
        tipo: "pikachu",
        treinador: 1,
        nivel: 25,
        vida: 100,
        vidaMaxima: 100,
        status: "ready",
      },
      loser: {
        id: 2,
        tipo: "charizard",
        treinador: 2,
        nivel: 20,
        vida: 0,
        vidaMaxima: 100,
        status: "fainted",
      },
      round: 5,
    };

    render(<BattleResultModal />);

    // Deve mostrar o pokémon do treinador B (charizard)
    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getAllByText("Lv.20")).toHaveLength(2); // Nível anterior e atual
  });
});
