import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

// Mock simples do useAuth
const mockUseAuth = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockOnTabChange = jest.fn();

const renderHeader = (
  activeTab: "list" | "battle" | "challenges" | "history" | "profile" = "list",
) => {
  return render(<Header activeTab={activeTab} onTabChange={mockOnTabChange} />);
};

describe("Header", () => {
  beforeEach(() => {
    mockOnTabChange.mockClear();
    mockUseAuth.mockReturnValue({
      user: { id: 1, nome: "Ash" },
      logout: jest.fn(),
    });
  });

  it("should render all navigation tabs", () => {
    renderHeader();

    expect(screen.getByText("📋 Ranking")).toBeInTheDocument();
    expect(screen.getByText("🥊 Treinadores")).toBeInTheDocument();
    expect(screen.getByText("📜 Histórico")).toBeInTheDocument();
    expect(screen.getByText("👤 Perfil")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    renderHeader("challenges");

    const challengesTab = screen.getByText("🥊 Treinadores");
    expect(challengesTab).toHaveClass("bg-purple-600", "text-white");
  });

  it("should call onTabChange when tab is clicked", () => {
    renderHeader();

    const historyTab = screen.getByText("📜 Histórico");
    fireEvent.click(historyTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("history");
  });

  it("should display user information", () => {
    renderHeader();

    expect(screen.getByText("Ash")).toBeInTheDocument();
  });

  it("should show user dropdown when avatar button is clicked", () => {
    renderHeader();

    // Encontrar o botão do avatar (primeira letra do nome)
    const avatarButton = screen.getByText("A");
    fireEvent.click(avatarButton);

    expect(screen.getByText("Sair")).toBeInTheDocument();
  });
});
