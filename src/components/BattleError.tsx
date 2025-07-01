import RequireAuth from "./RequireAuth";

export default function BattleError() {
  return (
    <RequireAuth>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
        <div className="text-white text-xl text-center max-w-lg">
          Ocorreu um erro ao carregar a batalha.
          <br />
          Tente novamente ou volte para a Home.
          <div className="mt-6">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              🏠 Voltar para Home
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
