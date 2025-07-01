import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import PokemonCard from "./PokemonCard";
import Image from "next/image";

interface ProfileData {
  id: number;
  nome: string;
  avatar_url: string;
  status_message: string;
  total_battles: number;
  wins: number;
  losses: number;
  level: number;
  experience: number;
  winRate: number;
  nextLevelExp: number;
  expProgress: number;
}

interface Pokemon {
  id: number;
  tipo: string;
  treinador: string;
  nivel: number;
  batalhas?: number;
  vitorias?: number;
  derrotas?: number;
  winRate?: number;
}

export default function ProfileTab() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    status_message: "",
  });
  const [novoTipo, setNovoTipo] = useState("pikachu");
  const [criandoPokemon, setCriandoPokemon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiposDisponiveis = ["pikachu", "charizard", "mewtwo"];

  useEffect(() => {
    fetchProfile();
    fetchPokemons();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/profile");
      setProfile(response.data);
      setFormData({
        nome: response.data.nome,
        status_message: response.data.status_message || "",
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPokemons = async () => {
    try {
      const response = await api.get("/me/pokemons/estatisticas");
      setPokemons(response.data);
    } catch (error) {
      console.error("Erro ao buscar pokémons:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await api.put("/profile", formData);

      // Atualizar dados do usuário no contexto
      if (response.data.trainer) {
        updateUser(response.data.trainer);
      }

      setProfile(response.data.trainer);
      setEditMode(false);

      // Mostrar mensagem de sucesso
      alert("Perfil atualizado com sucesso!");
    } catch (error: unknown) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Erro ao atualizar perfil";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Atualizar dados do usuário no contexto
      if (response.data.trainer) {
        updateUser(response.data.trainer);
      }

      setProfile(response.data.trainer);

      // Mostrar mensagem de sucesso
      alert("Avatar atualizado com sucesso!");

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      console.error("Erro ao fazer upload do avatar:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Erro ao fazer upload do avatar";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePokemon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTipo) return;

    try {
      setCriandoPokemon(true);
      await api.post("/pokemons", { tipo: novoTipo });
      await fetchPokemons(); // Recarregar lista
      setNovoTipo("pikachu");
    } catch (error: unknown) {
      console.error("Erro ao criar pokémon:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Erro ao criar pokémon";
      alert(errorMessage);
    } finally {
      setCriandoPokemon(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {profile && (
        <div className="space-y-8">
          {/* Seção do Perfil */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              👤 Meu Perfil
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Image
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.nome}`
                    }
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-gray-200 mx-auto"
                  />
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <span>📷</span>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Clique na câmera para trocar o avatar
                </p>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2">
                {editMode ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        minLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem de Status
                      </label>
                      <textarea
                        name="status_message"
                        value={formData.status_message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.status_message.length}/100
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {loading ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <p className="text-gray-900 text-lg">{profile.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="text-gray-900">
                        {profile.status_message || "Nenhuma mensagem de status"}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                      ✏️ Editar Perfil
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Estatísticas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {profile.level}
                  </p>
                  <p className="text-sm text-gray-600">Nível</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {profile.winRate}%
                  </p>
                  <p className="text-sm text-gray-600">Taxa de Vitória</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {profile.total_battles}
                  </p>
                  <p className="text-sm text-gray-600">Total de Batalhas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {profile.experience}
                  </p>
                  <p className="text-sm text-gray-600">Experiência</p>
                </div>
              </div>

              {/* Estatísticas Detalhadas */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">
                    {profile.wins}
                  </p>
                  <p className="text-sm text-green-600">Vitórias</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">
                    {profile.losses}
                  </p>
                  <p className="text-sm text-red-600">Derrotas</p>
                </div>
              </div>

              {/* Experience Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso do Nível</span>
                  <span>{profile.expProgress}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profile.expProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Próximo nível: {profile.nextLevelExp} exp
                </p>
              </div>
            </div>
          </div>

          {/* Seção dos Pokémons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🧑‍🎓 Meus Pokémons
            </h2>

            {/* Formulário para criar pokémon */}
            <form
              onSubmit={handleCreatePokemon}
              className="flex gap-2 mb-6 justify-between items-center"
            >
              <div className="flex gap-2">
                {tiposDisponiveis.map((tipo) => (
                  <button
                    key={tipo}
                    value={tipo}
                    className={
                      novoTipo === tipo
                        ? "bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                        : "bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setNovoTipo(tipo);
                    }}
                  >
                    <Image
                      src={`/assets/8bit/${tipo}.webp`}
                      alt={tipo}
                      width={32}
                      height={32}
                    />
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                disabled={criandoPokemon}
              >
                {criandoPokemon ? "Adicionando..." : "Adicionar"}
              </button>
            </form>
            {/* Grid de pokémons */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {pokemons.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
              ))}
              {pokemons.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  <p className="text-lg">Nenhum pokémon encontrado.</p>
                  <p className="text-sm">Crie seu primeiro pokémon acima!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
