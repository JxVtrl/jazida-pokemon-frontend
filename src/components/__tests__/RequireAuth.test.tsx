import { render, screen } from "@testing-library/react";
import RequireAuth from "../RequireAuth";

// Mock simples do useAuth
const mockUseAuth = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  it("should render children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nome: "Ash" },
      loading: false,
    });

    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("should show loading when authentication is in progress", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <RequireAuth>
        <div data-testid="protected-content">Protected Content</div>
      </RequireAuth>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should show loading screen with correct styling", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>,
    );

    const loadingContainer = screen.getByText("Carregando...").parentElement;
    expect(loadingContainer).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center",
      "bg-gray-100",
    );
  });
});
