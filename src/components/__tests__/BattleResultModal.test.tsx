import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BattleResultModal from "../BattleResultModal";
import type { Pokemon } from "@/types";

const mockPokemon: Pokemon = {
  id: 1,
  tipo: "pikachu",
  treinador: "Ash",
  nivel: 25,
  nivelAnterior: 24,
};

const mockOnClose = jest.fn();

const renderModal = (
  isOpen = true,
  result: "victory" | "defeat" | "death" = "victory",
) => {
  return render(
    <BattleResultModal
      isOpen={isOpen}
      onClose={mockOnClose}
      pokemon={mockPokemon}
      result={result}
    />,
  );
};

describe("BattleResultModal", () => {
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("should not render when isOpen is false", () => {
    renderModal(false);

    expect(screen.queryByText("🎉 Vitória!")).not.toBeInTheDocument();
  });

  it("should render victory message correctly", () => {
    renderModal(true, "victory");

    expect(screen.getByText("🎉 Vitória!")).toBeInTheDocument();
    expect(
      screen.getByText("Seu pokémon ganhou experiência!"),
    ).toBeInTheDocument();
  });

  it("should render defeat message correctly", () => {
    renderModal(true, "defeat");

    expect(screen.getByText("😔 Derrota")).toBeInTheDocument();
    expect(
      screen.getByText("Seu pokémon perdeu experiência..."),
    ).toBeInTheDocument();
  });

  it("should render death message correctly", () => {
    renderModal(true, "death");

    expect(screen.getByText("💀 Pokémon Derrotado")).toBeInTheDocument();
    expect(
      screen.getByText("Seu pokémon foi derrotado e não sobreviveu..."),
    ).toBeInTheDocument();
  });

  it("should display pokemon information", () => {
    renderModal();

    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("Lv.24")).toBeInTheDocument();
    expect(screen.getByText("Lv.25")).toBeInTheDocument();
  });

  it("should show level change indicator", async () => {
    renderModal();

    await waitFor(
      () => {
        expect(screen.getByText("+1")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("should call onClose when close button is clicked", () => {
    renderModal();

    const closeButton = screen.getByText("Fechar");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show pokemon image", () => {
    renderModal();

    const image = screen.getByAltText("pikachu");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", expect.stringContaining("pikachu"));
  });
});
