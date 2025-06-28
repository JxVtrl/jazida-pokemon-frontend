"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useBattleStore } from "@/store/battleStore";
import { getPokemonGifByLevel } from "@/utils/getPokemonGifByLevel";
import api from "@/lib/api";

export default function BatalhaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    setTrainer,
    connectSocket,
    disconnectSocket,
    joinBattle,
    leaveBattle,
    battle,
    fetchMyPokemons,
    myPokemons,
  } = useBattleStore();

  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null,
  );
  const [pokemonsLoading, setPokemonsLoading] = useState(false);
  const [aguardandoAdversario, setAguardandoAdversario] = useState(false);
  const [loadingBg, setLoadingBg] = useState("/assets/gifs/loading.gif");
  const [battleBg] = useState("/assets/battle.webp");
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [showBattleResult, setShowBattleResult] = useState(false);
  const [hasSelectedPokemon, setHasSelectedPokemon] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    console.log("🎯 Iniciando configuração da página de batalha:", {
      id,
      user,
    });

    // Resetar estado de seleção de pokémon
    setHasSelectedPokemon(false);
    setAguardandoAdversario(false);
    setSelectedPokemonId(null);

    // Primeiro configurar treinador no store
    setTrainer({ id: user.id, nome: user.nome });
    console.log("👤 Treinador configurado no store:", {
      id: user.id,
      nome: user.nome,
    });

    // Depois conectar socket (que precisa do trainer configurado)
    connectSocket();
    console.log("🔗 Socket conectado");

    // Buscar pokémons do treinador
    setPokemonsLoading(true);
    console.log("🔄 Iniciando busca de pokémons do treinador...");
    fetchMyPokemons()
      .then(() => {
        console.log("✅ Pokémons carregados com sucesso");
      })
      .catch((error) => {
        console.error("❌ Erro ao carregar pokémons:", error);
      })
      .finally(() => {
        setPokemonsLoading(false);
      });

    // Entrar na batalha (após um pequeno delay para garantir que o socket está conectado)
    setTimeout(() => {
      joinBattle(id as string);
    }, 100);

    return () => {
      leaveBattle();
      disconnectSocket();
    };
  }, [
    id,
    user,
    setTrainer,
    connectSocket,
    fetchMyPokemons,
    joinBattle,
    leaveBattle,
    disconnectSocket,
  ]);

  // Debug: logar pokémons quando mudarem
  useEffect(() => {
    console.log("🎯 Pokémons na página de batalha:", myPokemons);
  }, [myPokemons]);

  // Detectar quando o usuário sai da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🚪 Usuário saindo da página de batalha");
      leaveBattle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("🚪 Página ficou oculta");
        leaveBattle();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [leaveBattle]);

  const handlePokemonSelect = async (pokemonId: number) => {
    setSelectedPokemonId(pokemonId);
    setAguardandoAdversario(true);
    setHasSelectedPokemon(true);
    try {
      await api.post(`/batalha/${id}/iniciar`, { pokemonAId: pokemonId });
      // Após selecionar, re-entrar na sala da batalha (caso o socket tenha reconectado)
      joinBattle(id as string);
      console.log("Pokémon selecionado e enviado para o backend:", pokemonId);
    } catch {
      setAguardandoAdversario(false);
      setHasSelectedPokemon(false);
    }
  };

  // Quando a batalha realmente começar, remove o estado de aguardando
  useEffect(() => {
    if (battle) {
      setAguardandoAdversario(false);
    }
  }, [battle]);

  // Timer para redirecionamento após batalha finalizada
  useEffect(() => {
    if (battle?.status === "finished") {
      setRedirectTimer(5);
      const interval = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = "/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [battle?.status]);

  useEffect(() => {
    if (battle?.status === "finished") {
      setShowBattleResult(true);
    }
  }, [battle?.status]);

  const getHealthBarColor = (vida: number, vidaMaxima: number) => {
    const percentage = (vida / vidaMaxima) * 100;
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Sprites (agora usando GIFs)
  const getSprite = (tipo: string, nivel: number, back = false) => {
    // Se back, mostra o GIF de costas (ex: tipo-back.gif), senão o normal
    const gifPath = getPokemonGifByLevel(tipo, nivel);
    if (back) {
      // Tenta buscar um gif de costas, se existir
      const backGif = gifPath.replace(".gif", "-back.gif");
      // Se existir o arquivo, usa ele. Caso contrário, usa o normal.
      // Como não temos verificação de existência, sempre retorna o backGif (adicione os arquivos ou ajuste se necessário)
      return (
        <Image
          src={backGif}
          alt={tipo + " costas"}
          width={128}
          height={128}
          className="w-32 h-32 object-contain mx-auto"
        />
      );
    }
    return (
      <Image
        src={gifPath}
        alt={tipo}
        width={128}
        height={128}
        className="w-32 h-32 object-contain mx-auto"
      />
    );
  };

  useEffect(() => {
    const updateBg = () => {
      if (typeof window !== "undefined") {
        setLoadingBg(
          window.innerWidth <= 768
            ? "/assets/gifs/loading_mobile.gif"
            : "/assets/gifs/loading.gif",
        );
      }
    };
    updateBg();
    window.addEventListener("resize", updateBg);
    return () => window.removeEventListener("resize", updateBg);
  }, []);

  // Função para obter nome do treinador pelo ID
  const getTrainerName = (id: number) => {
    if (id === user?.id) return user?.nome;
    // Tenta buscar pelo adversário (oponentPokemon)
    if (battle && battle.pokemonA && battle.pokemonB) {
      const opponentPokemon =
        battle.pokemonA.treinador === user?.id
          ? battle.pokemonB
          : battle.pokemonA;
      if (opponentPokemon && opponentPokemon.treinador === id)
        return "Adversário";
    }
    return "Treinador";
  };

  // Componente StatusBox para o layout clássico
  function StatusBox({
    nome,
    nivel,
    hpAtual,
    hpMax,
  }: {
    nome: string;
    nivel: number;
    hpAtual: number;
    hpMax: number;
  }) {
    const hpPercent = Math.max(0, Math.min(100, (hpAtual / hpMax) * 100));
    return (
      <div className="bg-[#f8f8e8] border-2 border-gray-400 rounded-lg shadow-md px-4 py-2 w-64">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-gray-800">{nome}</span>
          <span className="text-gray-700 text-sm">Lv {nivel}</span>
        </div>
        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-1">
          <div
            className="h-4 bg-green-500 transition-all"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-600">
          HP: {hpAtual}/{hpMax}
        </div>
      </div>
    );
  }

  // --- NOVO LAYOUT DE BATALHA CLÁSSICO ---
  if (battle && battle.pokemonA && battle.pokemonB) {
    // Determinar quem é o player e quem é o oponente
    const myPokemon =
      battle.pokemonA.treinador === user?.id
        ? battle.pokemonA
        : battle.pokemonB;
    const opponentPokemon =
      battle.pokemonA.treinador === user?.id
        ? battle.pokemonB
        : battle.pokemonA;

    // Definir mensagem da batalha
    let message = "";
    if (battle.status === "finished" && battle.winner && battle.loser) {
      message = `Vitória de ${battle.winner.treinador || battle.winner.tipo}!`;
    } else if (battle.status === "fighting") {
      message = `Round ${battle.round} - A batalha está em andamento!`;
    } else if (battle.status === "starting") {
      message = "Preparando batalha...";
    } else {
      message = "Aguardando ação dos treinadores...";
    }

    const mensagemBatalha = message;

    return (
      <RequireAuth>
        <div className="relative min-h-screen flex flex-col justify-end bg-[#e0e0d0]">
          {/* Status adversário */}
          <div className="absolute top-8 left-8 z-10">
            <StatusBox
              nome={opponentPokemon.tipo}
              nivel={opponentPokemon.nivel}
              hpAtual={opponentPokemon.vida}
              hpMax={opponentPokemon.vidaMaxima}
            />
          </div>
          {/* Status player */}
          <div className="absolute bottom-40 right-8 z-10">
            <StatusBox
              nome={myPokemon.tipo}
              nivel={myPokemon.nivel}
              hpAtual={myPokemon.vida}
              hpMax={myPokemon.vidaMaxima}
            />
          </div>
          {/* Sprites */}
          <div className="flex flex-1 items-center justify-between px-32">
            <Image
              src={getPokemonGifByLevel(
                opponentPokemon.tipo,
                opponentPokemon.nivel,
              )}
              width={160}
              height={160}
              className="w-40 h-40"
              alt={opponentPokemon.tipo}
            />
            <Image
              src={getPokemonGifByLevel(myPokemon.tipo, myPokemon.nivel)}
              width={160}
              height={160}
              className="w-40 h-40"
              alt={myPokemon.tipo}
            />
          </div>
          {/* Caixa de mensagem */}
          <div className="w-full bg-[#5a8fa3] border-4 border-[#e0e0d0] rounded-t-2xl shadow-lg p-6 min-h-[100px] text-white text-xl font-mono">
            {mensagemBatalha}
          </div>
        </div>
      </RequireAuth>
    );
  }

  // --- NOVA INTERFACE VISUAL CLÁSSICA POKÉMON ---
  if (
    showBattleResult &&
    battle?.status === "finished" &&
    battle.winner &&
    battle.loser
  ) {
    return (
      <RequireAuth>
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-4">
          <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-xl shadow-lg p-8 text-xl font-mono text-gray-800 text-center">
            <div className="mb-4">
              <span className="font-bold text-green-700 text-2xl mr-2">
                {getTrainerName(Number(battle.winner.treinador))} (
                {battle.winner.tipo})
              </span>
              venceu!
              <span className="ml-4 text-gray-500 text-lg">
                ({getTrainerName(Number(battle.loser.treinador))} -{" "}
                {battle.loser.tipo} perdeu)
              </span>
            </div>
            <div className="text-gray-600 text-sm mb-2">
              Redirecionando para a Home em {redirectTimer}...
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  // Mostrar seleção de pokémon se:
  // 1. Não há batalha ativa OU
  // 2. Batalha existe mas ainda não começou (status 'waiting') OU
  // 3. Usuário ainda não selecionou pokémon
  if (!battle || battle.status === "waiting" || !hasSelectedPokemon) {
    console.log("🎯 Renderizando seleção de pokémons:", {
      hasBattle: !!battle,
      battleStatus: battle?.status,
      hasSelectedPokemon,
      aguardandoAdversario,
      myPokemonsCount: myPokemons.length,
      pokemonsLoading,
    });

    if (!aguardandoAdversario) {
      // Mostrar seleção de pokémons estilo party
      return (
        <RequireAuth>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-4">
            <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-center mb-4">
                Selecione seu Pokémon
              </h2>
              <div>
                {myPokemons.length === 0 && (
                  <div className="text-center text-gray-600 py-8">
                    Você não tem pokémons para batalhar.
                    <br />
                    <span className="text-xs">
                      Crie pokémons no seu dashboard primeiro.
                    </span>
                  </div>
                )}
                {myPokemons.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={`flex items-center p-2 rounded-lg border mb-2 cursor-pointer transition-all
                                            ${selectedPokemonId === pokemon.id ? "bg-blue-200 border-blue-500" : "bg-white border-gray-200"}
                                        `}
                    onClick={() => handlePokemonSelect(pokemon.id)}
                  >
                    <Image
                      src={getPokemonGifByLevel(pokemon.tipo, pokemon.nivel)}
                      width={40}
                      height={40}
                      className="w-10 h-10 mr-2"
                      alt={pokemon.tipo}
                    />
                    <div className="flex-1">
                      <div className="font-bold capitalize">
                        {pokemon.tipo}{" "}
                        <span className="text-xs">Nv.{pokemon.nivel}</span>
                      </div>
                      <div className="text-xs text-gray-600">HP: 21/21</div>
                    </div>
                    {/* Outros status podem ser adicionados aqui */}
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => (window.location.href = "/")}
              >
                Sair
              </button>
              <div className="mt-4 text-center text-sm text-gray-600">
                {selectedPokemonId
                  ? "Clique novamente para confirmar"
                  : "Selecione um pokémon para batalhar"}
              </div>
            </div>
          </div>
        </RequireAuth>
      );
    } else {
      // Mostrar loading aguardando adversário
      return (
        <RequireAuth>
          <div
            className="min-h-screen flex items-center justify-center relative"
            style={{
              background: `url(${loadingBg}) center center / cover no-repeat, linear-gradient(to bottom right, #1e3a8a, #6d28d9, #b91c1c)`,
            }}
          >
            <div className="absolute inset-0" />
            <div className="text-center text-white z-10 w-full">
              <p className="text-2xl font-bold drop-shadow-lg">
                Aguardando o adversário escolher...
              </p>
            </div>
          </div>
        </RequireAuth>
      );
    }
  }

  // --- PROTEÇÃO CONTRA BATTLE NULO OU INCOMPLETO ---
  if (!battle || !battle.pokemonA || !battle.pokemonB) {
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

  // Só executa daqui pra frente se battle existe
  // Definir mensagem da batalha para o layout padrão
  let message = "";
  if (battle.status === "finished" && battle.winner && battle.loser) {
    message = `Vitória de ${battle.winner.treinador || battle.winner.tipo}!`;
  } else if (battle.status === "fighting") {
    message = `Round ${battle.round} - A batalha está em andamento!`;
  } else if (battle.status === "starting") {
    message = "Preparando batalha...";
  } else {
    message = "Aguardando ação dos treinadores...";
  }

  // CORREÇÃO: Determinar qual pokémon é do treinador atual e qual é do adversário
  // Só definir essas variáveis se battle existir e tiver pokemonA e pokemonB
  const myPokemon =
    battle && battle.pokemonA && battle.pokemonB
      ? battle.pokemonA.treinador === user?.id
        ? battle.pokemonA
        : battle.pokemonB
      : null;
  const opponentPokemon =
    battle && battle.pokemonA && battle.pokemonB
      ? battle.pokemonA.treinador === user?.id
        ? battle.pokemonB
        : battle.pokemonA
      : null;

  return (
    <RequireAuth>
      <div
        className="min-h-screen flex flex-col justify-between items-center p-4"
        style={{
          background: `url(${battleBg}) center center / cover no-repeat, linear-gradient(to bottom right, #1e3a8a, #6d28d9, #b91c1c)`,
        }}
      >
        {/* Indicador de Round */}
        {battle.status === "fighting" && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
              ROUND {battle.round}
            </div>
          </div>
        )}

        {/* Status dos pokémons */}
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 mt-8">
          {/* Oponente (Topo) */}
          {opponentPokemon && (
            <div className="flex flex-col items-end">
              <div className="bg-white/80 rounded-lg shadow-lg px-4 py-2 w-72 mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">
                    {opponentPokemon.tipo}
                  </span>
                  <span className="text-gray-700 font-mono">
                    Lv{opponentPokemon.nivel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">HP</span>
                  <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className={`h-3 transition-all duration-500 ${getHealthBarColor(opponentPokemon.vida, opponentPokemon.vidaMaxima)}`}
                      style={{
                        width: `${(opponentPokemon.vida / opponentPokemon.vidaMaxima) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 ml-2">
                    {opponentPokemon.vida}/{opponentPokemon.vidaMaxima}
                  </span>
                </div>
              </div>
              {/* Sprite do oponente (frente) */}
              <div className="-mb-8 mt-2 flex justify-end w-full">
                <div
                  className={`${battle.status === "fighting" ? "animate-pulse" : ""}`}
                >
                  {getSprite(
                    opponentPokemon.tipo,
                    opponentPokemon.nivel,
                    false,
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Player (Baixo) */}
          {myPokemon && (
            <div className="flex flex-col items-start mt-24">
              {/* Sprite do player (costas) */}
              <div className="-mb-8 flex justify-start w-full">
                <div
                  className={`${battle.status === "fighting" ? "animate-pulse" : ""}`}
                >
                  {getSprite(myPokemon.tipo, myPokemon.nivel, true)}
                </div>
              </div>
              <div className="bg-white/80 rounded-lg shadow-lg px-4 py-2 w-72 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">
                    {myPokemon.tipo}
                  </span>
                  <span className="text-gray-700 font-mono">
                    Lv{myPokemon.nivel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">HP</span>
                  <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className={`h-3 transition-all duration-500 ${getHealthBarColor(myPokemon.vida, myPokemon.vidaMaxima)}`}
                      style={{
                        width: `${(myPokemon.vida / myPokemon.vidaMaxima) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 ml-2">
                    {myPokemon.vida}/{myPokemon.vidaMaxima}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Caixa de mensagem */}
        <div className="w-full max-w-2xl mx-auto mt-16 mb-8">
          <div className="bg-white/90 rounded-xl shadow-lg p-6 text-xl font-mono text-gray-800 text-center min-h-[64px] flex items-center justify-center">
            {battle.status === "finished" && battle.winner && battle.loser ? (
              <div className="text-center">
                <div className="mb-4">
                  <span className="font-bold text-green-700 text-2xl mr-2">
                    {getTrainerName(Number(battle.winner.treinador))} (
                    {battle.winner.tipo})
                  </span>
                  venceu!
                  <span className="ml-4 text-gray-500 text-lg">
                    ({getTrainerName(Number(battle.loser.treinador))} -{" "}
                    {battle.loser.tipo} perdeu)
                  </span>
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  Redirecionando para a Home em {redirectTimer}...
                </div>
              </div>
            ) : (
              <span>{message}</span>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
