"use client";

import { useState, useEffect, useRef } from "react";
import { SoccerBallIcon, SoccerPlayerAvatarIcon } from "../components/svgs";
import { useMessages } from "@/providers/message-provider";
import "flag-icons/css/flag-icons.min.css";

import {
  Calendar,
  CircleOff,
  Clock,
  Clock8,
  Dice2,
  Dice3,
  Dice4,
  Group,
  Loader,
  LockKeyhole,
  Medal,
  Save,
  Swords,
} from "lucide-react";
import MessageDisplay from "@/components/ui/MessageDisplay";

type Match = {
  id: number;
  phase: string;
  group_name: string | null;
  team_a: string;
  team_b: string;
  match_date: string;
  bet_score_a?: number;
  bet_score_b?: number;
  official_score_a?: number;
  official_score_b?: number;
  is_finished?: boolean;
  can_edit?: boolean;
  lock_reason?: string;
  betting_deadline?: string;
};

function LockedInput({
  value,
  onChange,
  isLocked,
  placeholder,
}: {
  value: number | string;
  onChange: (value: number) => void;
  isLocked: boolean;
  lockReason?: string;
  placeholder?: string;
}) {
  if (isLocked) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled
          className="w-20 mx-auto mt-2 text-center text-2xl font-bold bg-slate-950/15 border-2 border-slate-600 rounded-lg p-2 cursor-not-allowed opacity-60"
          placeholder={placeholder}
        />
      </div>
    );
  }

  const getSafeValue = () => {
    if (value === undefined || value === null) return "";
    const num = Number(value);
    if (isNaN(num)) return "";
    return String(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={getSafeValue()}
      onClick={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const rawValue = e.target.value;
        if (rawValue === "") {
          onChange(0);
          return;
        }
        const numValue = parseInt(rawValue, 10);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
          onChange(numValue);
        }
      }}
      className="w-20 mx-auto mt-2 text-center text-2xl font-bold bg-slate-100 text-slate-950 border-2 border-slate-600 focus:border-green-500 focus:outline-none rounded-lg p-2 hover:border-slate-500 transition cursor-pointer"
      placeholder={placeholder}
    />
  );
}

export const countryCodeMap: Record<string, string> = {
  Catar: "qa",
  Equador: "ec",
  Senegal: "sn",
  Holanda: "nl",
  Inglaterra: "gb-eng",
  Irã: "ir",
  EUA: "us",
  "País de Gales": "gb-wls",
  Argentina: "ar",
  "Arábia Saudita": "sa",
  México: "mx",
  Polônia: "pl",
  França: "fr",
  Austrália: "au",
  Dinamarca: "dk",
  Tunísia: "tn",
  Espanha: "es",
  "Costa Rica": "cr",
  Alemanha: "de",
  Japão: "jp",
  Bélgica: "be",
  Canadá: "ca",
  Marrocos: "ma",
  Croácia: "hr",
  Brasil: "br",
  Sérvia: "rs",
  Suíça: "ch",
  Camarões: "cm",
  Portugal: "pt",
  Gana: "gh",
  Uruguai: "uy",
  "Coreia do Sul": "kr",
};

export function Flag({ country }: { country: string }) {
  const code = countryCodeMap[country]?.toLowerCase();
  if (!code) return null;

  return (
    <span
      className={`fi fi-${code}`}
      style={{
        display: "inline-block",
        width: "32px",
        height: "24px",
        minWidth: "32px",
        minHeight: "24px",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontSize: "0",
        lineHeight: "1",
        flexShrink: 0,
      }}
    />
  );
}

export default function BetsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activePhase, setActivePhase] = useState("groups");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [tempBets, setTempBets] = useState<{
    [key: number]: { a: number; b: number };
  }>({});

  const { addMessage } = useMessages();
  const isFetching = useRef(false);
  const lastFetchTime = useRef(0);

  const phases = [
    { key: "groups", label: "Fase de Grupos", icon: <Group /> },
    { key: "round16", label: "Oitavas de Final", icon: <Clock8 /> },
    { key: "quarter", label: "Quartas de Final", icon: <Dice4 /> },
    { key: "semi", label: "Semifinais", icon: <Dice2 /> },
    { key: "third", label: "Disputa de 3º", icon: <Dice3 /> },
    { key: "final", label: "FINAL", icon: <Medal /> },
  ];

  const fetchMatches = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isFetching.current) {
      console.log("⏳ Já está carregando, ignorando...");
      return;
    }

    // Evitar chamadas muito frequentes
    const now = Date.now();
    if (now - lastFetchTime.current < 500) {
      console.log("⏳ Chamada muito rápida, ignorando...");
      return;
    }

    isFetching.current = true;
    lastFetchTime.current = now;

    try {
      const token = localStorage.getItem("token");
      const timestamp = Date.now();
      const response = await fetch(`/api/matches?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      const currentDate = new Date();
      const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );

      const processedMatches = data.map((match: any) => {
        const matchDateRaw = new Date(match.match_date);
        const matchDay = new Date(
          matchDateRaw.getFullYear(),
          matchDateRaw.getMonth(),
          matchDateRaw.getDate(),
        );
        const deadline = new Date(matchDay);
        deadline.setDate(deadline.getDate() - 1);

        const hasResult =
          match.official_score_a !== null && match.official_score_b !== null;
        const isFinished = match.is_finished === 1;
        const isBlocked = today >= deadline;

        let isLocked = false;
        let lockReason = null;

        if (hasResult) {
          isLocked = true;
          lockReason = `Resultado oficial já lançado (${match.official_score_a} x ${match.official_score_b})`;
        } else if (isFinished) {
          isLocked = true;
          lockReason = "Jogo já finalizado";
        } else if (isBlocked) {
          isLocked = true;
          lockReason = `Prazo encerrado (apostas só até ${deadline.toLocaleDateString("pt-BR")})`;
        }

        return {
          ...match,
          can_edit: !isLocked,
          lock_reason: lockReason,
          betting_deadline: deadline
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        };
      });

      setMatches(processedMatches);

      // Inicializar valores temporários
      const initialTemp: { [key: number]: { a: number; b: number } } = {};
      processedMatches.forEach((match: Match) => {
        initialTemp[match.id] = {
          a: match.bet_score_a ?? 0,
          b: match.bet_score_b ?? 0,
        };
      });
      setTempBets(initialTemp);

      const liberados = processedMatches.filter(
        (m: Match) => m.can_edit === true,
      ).length;
      console.log(
        `📊 Liberados: ${liberados} | Total: ${processedMatches.length}`,
      );
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name);
        setIsAdmin(userData.is_admin === true);
      } catch (e) {
        console.error("Erro ao parsear user:", e);
      }
    }

    fetchMatches();
  }, []);

  const updateTempBet = (matchId: number, scoreA: number, scoreB: number) => {
    setTempBets((prev) => ({
      ...prev,
      [matchId]: { a: scoreA, b: scoreB },
    }));
  };

  const saveBet = async (matchId: number) => {
    const match = matches.find((m) => m.id === matchId);
    const tempBet = tempBets[matchId];

    if (!match?.can_edit) {
      addMessage(
        "warning",
        `Não é possível alterar esta aposta: ${match?.lock_reason || "Jogo bloqueado"}`,
      );
      return;
    }

    if (!tempBet) return;

    const scoreA = tempBet.a;
    const scoreB = tempBet.b;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, scoreA, scoreB }),
      });

      const data = await response.json();

      if (response.status === 403) {
        addMessage("error", `${data.error}`);
        await fetchMatches();
        return;
      }

      if (response.ok) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? { ...m, bet_score_a: scoreA, bet_score_b: scoreB }
              : m,
          ),
        );
        addMessage("success", "✅ Aposta salva com sucesso!");
      } else if (response.status === 401) {
        window.location.href = "/login";
      } else {
        addMessage("error", data.error || "Erro ao salvar aposta");
      }
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao salvar aposta. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const filteredMatches = matches
    .filter((m) => m.phase === activePhase)
    .sort((a, b) => {
      if (activePhase === "groups") {
        const groupA = a.group_name || "";
        const groupB = b.group_name || "";
        return groupA.localeCompare(groupB);
      }
      return (
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      );
    });

  const getPhaseLabel = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      groups: "Fase de Grupos",
      round16: "Oitavas de Final",
      quarter: "Quartas de Final",
      semi: "Semifinal",
      third: "Disputa de 3º Lugar",
      final: "Final",
    };
    return phaseMap[phase] || phase;
  };

  const phaseIconMap = Object.fromEntries(phases.map((p) => [p.key, p.icon]));

  if (loading) {
    return (
      <div className="text-slate-950 min-h-screen bg-smui-surface-3 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl mb-4 animate-bounce">
            <SoccerBallIcon size={50} />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <p className="text-xl">Carregando Apostas</p>
              <span className="w-1 h-1 bg-slate-950 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-slate-950 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-slate-950 rounded-full animate-bounce" />
            </div>
          </div>
          <p className="text-sm mt-2 text-slate-800">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smui-surface-3 text-smui-dark-surface-0">
      <div className="border-smui-dark-surface-3/50 bg-smui-green/85 backdrop-blur-sm border-b sticky top-0 z-10">
        <MessageDisplay />
        <div className="py-2 px-6">
          <div className="flex items-center justify-center flex-wrap sm:justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <SoccerPlayerAvatarIcon size={38} className="mr-2" />
              </div>
              <div className="text-sm">
                <h1 className="text-2xl font-bold">Bolão Copa 2026</h1>
                {userName && (
                  <span className="text-smui-orange">Olá, {userName}!</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap justify-center">
              <button
                onClick={() => (window.location.href = "/ranking")}
                className="cursor-pointer w-28 h-8 bg-smui-yellow hover:bg-smui-yellow/80 text-slate-950 font-semibold px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50"
              >
                Ranking
              </button>
              {isAdmin && (
                <button
                  onClick={() => (window.location.href = "/admin/results")}
                  className="cursor-pointer w-28 h-8 bg-smui-purple hover:bg-smui-purple/80 px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="cursor-pointer w-28 h-8 bg-smui-red hover:bg-smui-red/80 px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="bg-smui-surface-2 p-2 border border-smui-dark-surface-3/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              <Clock />
            </span>
            <div>
              <p className="font-semibold text-smui-green">Regra de Apostas</p>
              <p className="text-sm">
                Você pode apostar ou alterar sua aposta até{" "}
                <strong className="text-smui-red">1 dia antes</strong> do jogo.
                Após esse prazo, as apostas ficam bloqueadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-2 text-smui-dark-surface-0 mb-10">
        <div className="flex gap-2 mt-4 mb-4 justify-center items-center flex-wrap">
          {phases.map((phase) => (
            <button
              key={phase.key}
              onClick={() => setActivePhase(phase.key)}
              className={`
                p-2 w-70 font-bold transition-all transform flex items-center justify-start cursor-pointer
                ${
                  activePhase === phase.key
                    ? "bg-smui-green text-slate-950 border border-smui-dark-surface-3/50"
                    : "bg-smui-surface-2 border border-smui-dark-surface-3/50"
                }
              `}
            >
              <span className="mr-2">{phase.icon}</span>
              {phase.label}
            </button>
          ))}
        </div>

        <div
          className={`grid gap-4 text-smui-dark-surface-0 ${
            filteredMatches.length === 1
              ? "grid-cols-1 w-full mx-auto"
              : "md:grid-cols-2 lg:grid-cols-2"
          }`}
        >
          {filteredMatches.map((match) => {
            const isLocked = match.can_edit === false;
            const lockReason = match.lock_reason;
            const tempBet = tempBets[match.id] || { a: 0, b: 0 };

            return (
              <div
                key={match.id}
                className={`bg-smui-surface-2 pb-0 border border-smui-dark-surface-3/50 overflow-hidden transition-all duration-300 text-smui-dark-surface-0 grid grid-rows-[60px_1fr_1fr_60px] grid-cols-[1fr_30px_1fr] [grid-template-areas:'header_header_header'_'title_title_title'_'input_input_input'_'footer_footer_footer'] ${
                  isLocked ? "opacity-95" : "hover:shadow-emerald-500/10"
                }`}
              >
                <div
                  className={`[grid-area:header] p-2 border-b border-smui-dark-surface-3/50 ${
                    isLocked ? "bg-smui-red/50" : "bg-smui-green/50"
                  }`}
                >
                  <div className="text-smui-dark-surface-0 text-md font-semibold flex justify-between items-center">
                    <span>
                      {match.group_name ? (
                        <div className="flex items-center gap-2">
                          <Group size={16} /> {`Grupo ${match.group_name}`}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {phaseIconMap[match.phase] && (
                            <span className="flex items-center size-4">
                              {phaseIconMap[match.phase]}
                            </span>
                          )}
                          {getPhaseLabel(match.phase)}
                        </div>
                      )}
                    </span>
                    {isLocked && (
                      <span className="text-xs bg-smui-red px-2 py-0.5 rounded-full">
                        Bloqueado
                      </span>
                    )}
                    {!isLocked && (
                      <span className="text-xs bg-smui-green px-2 py-0.5 rounded-full">
                        Liberado
                      </span>
                    )}
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(match.match_date).toLocaleDateString(
                      "pt-BR",
                    )} -{" "}
                    {new Date(match.match_date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="[grid-area:title] flex justify-around items-center px-4 py-2">
                  <div className="font-bold text-lg flex items-center justify-center gap-2">
                    <Flag country={match.team_a} />
                    {match.team_a}
                  </div>
                  <div className="text-lg font-bold">
                    <Swords />
                  </div>
                  <div className="font-bold text-lg flex items-center justify-center gap-2">
                    {match.team_b}
                    <Flag country={match.team_b} />
                  </div>
                </div>

                <div className="[grid-area:input] flex justify-around items-center px-4">
                  <LockedInput
                    value={tempBet.a}
                    onChange={(value) =>
                      updateTempBet(match.id, value, tempBet.b)
                    }
                    isLocked={isLocked}
                    lockReason={lockReason}
                    placeholder="?"
                  />
                  <LockedInput
                    value={tempBet.b}
                    onChange={(value) =>
                      updateTempBet(match.id, tempBet.a, value)
                    }
                    isLocked={isLocked}
                    lockReason={lockReason}
                    placeholder="?"
                  />
                </div>

                <div className="[grid-area:footer] flex justify-end items-center p-2">
                  {lockReason && (
                    <div className="bg-smui-red text-slate-950 text-xs p-2 flex gap-2 rounded">
                      <LockKeyhole size={14} />
                      <span>{lockReason}</span>
                    </div>
                  )}
                  {!isLocked && (
                    <button
                      onClick={() => saveBet(match.id)}
                      disabled={saving}
                      className="w-28 h-8 px-4 py-1.5 border bg-smui-yellow hover:bg-smui-yellow/80 cursor-pointer rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        "Salvar"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center flex items-center flex-col text-xl py-12">
            <CircleOff size={100} className="mb-8" />
            <p>Nenhum jogo disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
