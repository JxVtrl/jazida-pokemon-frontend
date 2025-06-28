import { render, screen, waitFor, act } from "@testing-library/react";
import PokemonCard from "../PokemonCard";
import type { Pokemon } from "@/types";

// Mock das funções de imagem
jest.mock("@/utils/getPokemonGifByLevel", () => ({
  getPokemonGifByLevel: jest.fn(() => "/assets/gifs/pikachu/pikachu.gif"),
}));

jest.mock("@/utils/imageCache", () => ({
  preloadGif: jest.fn(() => Promise.resolve()),
}));

const mockPokemon: Pokemon = {
  id: 1,
  tipo: "pikachu",
  treinador: "Ash",
  nivel: 25,
};

describe("PokemonCard", () => {
  it("should render pokemon information correctly", async () => {
    await act(async () => {
      render(<PokemonCard pokemon={mockPokemon} />);
    });

    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("Treinador: Ash")).toBeInTheDocument();
    expect(screen.getByText("Nível: 25")).toBeInTheDocument();
  });

  it("should display pokemon image after loading", async () => {
    await act(async () => {
      render(<PokemonCard pokemon={mockPokemon} />);
    });

    // Inicialmente mostra "Carregando..."
    expect(screen.getByText("Carregando...")).toBeInTheDocument();

    // Aguarda a imagem carregar
    await waitFor(() => {
      const image = screen.getByAltText("pikachu");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", expect.stringContaining("pikachu"));
    });
  });

  it("should apply correct styling", async () => {
    await act(async () => {
      render(<PokemonCard pokemon={mockPokemon} />);
    });

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("w-full", "max-w-sm", "mx-auto");
  });

  it("should handle different pokemon types", async () => {
    const charizardPokemon: Pokemon = {
      ...mockPokemon,
      tipo: "charizard",
      nivel: 50,
    };

    await act(async () => {
      render(<PokemonCard pokemon={charizardPokemon} />);
    });

    expect(screen.getByText("charizard")).toBeInTheDocument();
    expect(screen.getByText("Nível: 50")).toBeInTheDocument();
  });

  it("should show loading state initially", async () => {
    await act(async () => {
      render(<PokemonCard pokemon={mockPokemon} />);
    });

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });
});
