"use client";

import { SoccerBallIcon, SoccerScore } from "@/app/components/svgs";
import MessageDisplay from "@/components/ui/MessageDisplay";
import { useState, useEffect } from "react";
import { useMessages } from "@/providers/message-provider";
import {
  Calendar,
  CircleCheckBig,
  CircleOff,
  FileWarning,
  Loader,
  Save,
  Swords,
} from "lucide-react";
import { countryCodeMap, Flag } from "@/app/bets/page";

type Match = {
  id: number;
  phase: string;
  group_name: string | null;
  team_a: string;
  team_b: string;
  match_date: string;
  official_score_a: number | null;
  official_score_b: number | null;
  is_finished: boolean;
};

export default function AdminResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMatchId, setSavedMatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    [key: number]: { a: string; b: string };
  }>({});

  const { addMessage } = useMessages();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/matches/results", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.match_date).getTime();
        const dateB = new Date(b.match_date).getTime();

        if (dateA !== dateB) {
          return dateA - dateB;
        }

        if (a.group_name && b.group_name) {
          const groupCompare = a.group_name.localeCompare(b.group_name);
          if (groupCompare !== 0) return groupCompare;
        }

        if (a.group_name && !b.group_name) return -1;
        if (!a.group_name && b.group_name) return 1;

        const timeA = new Date(a.match_date).getTime();
        const timeB = new Date(b.match_date).getTime();
        return timeA - timeB;
      });

      setMatches(sortedData);

      const initialValues: { [key: number]: { a: string; b: string } } = {};
      sortedData.forEach((match: Match) => {
        initialValues[match.id] = {
          a:
            match.official_score_a !== null
              ? String(match.official_score_a)
              : "",
          b:
            match.official_score_b !== null
              ? String(match.official_score_b)
              : "",
        };
      });
      setEditValues(initialValues);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar jogos:", err);
      setError("Erro ao carregar jogos");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (
    matchId: number,
    team: "a" | "b",
    value: string,
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  // Função para atualizar o mata-mata
  const updateKnockout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/matches/update-knockout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        addMessage("success", "Mata-mata atualizado!");
        await fetchMatches(); // Recarregar a lista
      } else {
        addMessage("error", data.error || "Erro ao atualizar mata-mata");
      }
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao atualizar mata-mata");
    }
  };

  // Função para salvar o resultado e depois atualizar o mata-mata
  const saveResult = async (matchId: number) => {
    const values = editValues[matchId];
    if (!values) return;

    const scoreA = values.a === "" ? 0 : parseInt(values.a, 10);
    const scoreB = values.b === "" ? 0 : parseInt(values.b, 10);

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/matches/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, scoreA, scoreB }),
      });

      const data = await response.json();

      if (response.ok) {
        window.dispatchEvent(new Event("results-updated"));
      }

      if (response.ok) {
        setSavedMatchId(matchId);
        addMessage("success", "Resultado salvo!");

        // Recarregar a lista
        await fetchMatches();

        // ATUALIZAR O MATA-MATA AUTOMATICAMENTE
        await updateKnockout();

        setTimeout(() => setSavedMatchId(null), 2000);
      } else {
        setError(data.error || "Erro ao salvar resultado");
        addMessage("error", data.error || "Erro ao salvar resultado");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o servidor");
      addMessage("error", "Erro ao conectar com o servidor");
    } finally {
      setSaving(false);
    }
  };

  const getPhaseName = (phase: string) => {
    const phases: Record<string, string> = {
      groups: "Fase de Grupos",
      round16: "Oitavas de Final",
      quarter: "Quartas de Final",
      semi: "Semifinal",
      third: "Disputa 3º Lugar",
      final: "Final",
    };
    return phases[phase] || phase;
  };

  const phaseOrder = ["groups", "round16", "quarter", "semi", "third", "final"];

  const groupMatchesByPhase = () => {
    const groupedByPhase: { [phase: string]: Match[] } = {};

    phaseOrder.forEach((phase) => {
      groupedByPhase[phase] = [];
    });

    matches.forEach((match) => {
      if (groupedByPhase[match.phase]) {
        groupedByPhase[match.phase].push(match);
      }
    });

    phaseOrder.forEach((phase) => {
      groupedByPhase[phase].sort((a, b) => {
        if (phase === "groups") {
          const groupA = a.group_name || "";
          const groupB = b.group_name || "";
          const groupCompare = groupA.localeCompare(groupB);
          if (groupCompare !== 0) return groupCompare;
        }
        return (
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        );
      });
    });

    return groupedByPhase;
  };

  const groupedMatches = groupMatchesByPhase();

  if (loading) {
    return (
      <div className="text-slate-950 min-h-screen bg-smui-surface-3 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl mb-4 animate-bounce">
            <SoccerBallIcon size={50} />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <p className="text-xl">Carregando ADM</p>
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
    <div className="min-h-screen bg-smui-surface-3 text-slate-950">
      <MessageDisplay />

      {/* Cabeçalho */}
      <div className="border-smui-dark-surface-3/50 bg-slate-950/85 text-slate-100 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 flex-wrap">
          <div>
            <div className="flex gap-4 items-center justify-center">
              <SoccerScore size={50} />
              <div>
                <h1 className="text-xl font-bold">Resultados Oficiais</h1>
                <p className="text-smui-surface-2 text-xl">
                  Placares dos jogos
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 m-4">
            <button
              onClick={() => (window.location.href = "/admin/settings")}
              className="cursor-pointer w-28 h-8 bg-smui-yellow hover:bg-smui-yellow/80 text-slate-950 font-semibold px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50 flex items-center gap-2 justify-center"
            >
              Configs
            </button>
            <button
              onClick={() => (window.location.href = "/admin/users")}
              className="cursor-pointer w-28 h-8 bg-smui-green hover:bg-smui-green/80 text-slate-950 font-semibold px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50 flex items-center gap-2 justify-center"
            >
              Usuários
            </button>
            <button
              onClick={() => (window.location.href = "/bets")}
              className="cursor-pointer w-28 h-8 bg-smui-red hover:bg-smui-red/80 text-slate-950 font-semibold px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50 flex items-center gap-2 justify-center"
            >
              Apostas
            </button>
          </div>
        </div>
      </div>

      {/* Lista de jogos agrupados por fase */}
      {Object.entries(groupedMatches)
        .sort(
          ([phaseA], [phaseB]) =>
            phaseOrder.indexOf(phaseA) - phaseOrder.indexOf(phaseB),
        )
        .map(([phase, phaseMatches]) => (
          <div key={phase} className="m-4 ">
            {matches.length !== 0 && (
              <div className="text-xl font-bold text-slate-950 mb-4 flex gap-2 items-center ">
                <Calendar size={16} /> {getPhaseName(phase)}
              </div>
            )}
            <div
              className={`grid gap-4 text-smui-dark-surface-0 ${
                phaseMatches.length === 1
                  ? "grid-cols-1 w-full mx-auto"
                  : "md:grid-cols-2 lg:grid-cols-2"
              }`}
            >
              {phaseMatches.map((match) => {
                const values = editValues[match.id] || { a: "", b: "" };
                const hasResult = match.official_score_a !== null;

                return (
                  <div
                    key={match.id}
                    className="bg-smui-surface-2 border border-smui-dark-surface-3/50"
                  >
                    {/* Cabeçalho */}
                    <div className="bg-slate-500/25 border-b border-smui-dark-surface-3/50 flex justify-between items-start  flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap p-4">
                        <span className="text-xs p-2 bg-smui-purple/50 rounded font-bold">
                          {new Date(match.match_date).toLocaleTimeString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <span className="text-xs p-2 bg-smui-green/50 rounded font-bold">
                          {getPhaseName(match.phase)}
                        </span>
                        {match.group_name && (
                          <span className="text-xs p-2 bg-smui-orange/50 rounded font-bold">
                            Grupo {match.group_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Placar */}
                    <div className="flex items-center justify-between gap-1 p-2">
                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg mb-2 flex gap-2 items-center justify-center">
                          <Flag country={match.team_a} />
                          {match.team_a}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={values.a}
                          onChange={(e) =>
                            handleValueChange(match.id, "a", e.target.value)
                          }
                          className="w-24 mx-auto text-center text-2xl font-bold text-gray-950 border border-smui-dark-surface-3/50 focus:border-smui-green rounded-lg p-2"
                          placeholder="?"
                        />
                      </div>

                      <div>
                        <Swords size={30} />
                      </div>

                      <div className="flex-1 text-center">
                        <div className="font-bold text-lg mb-2 flex gap-2 items-center justify-center">
                          <Flag country={match.team_b} />
                          {match.team_b}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={values.b}
                          onChange={(e) =>
                            handleValueChange(match.id, "b", e.target.value)
                          }
                          className="w-24 mx-auto text-center text-2xl font-bold text-gray-950 border border-smui-dark-surface-3/50 focus:border-smui-green rounded-lg p-2"
                          placeholder="?"
                        />
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex items-center justify-end ">
                      {hasResult && savedMatchId !== match.id && (
                        <span className="bg-smui-green text-xs p-2 m-2 rounded font-bold">
                          ✓ Resultado: {match.official_score_a} x{" "}
                          {match.official_score_b}
                        </span>
                      )}
                      <button
                        onClick={() => saveResult(match.id)}
                        disabled={saving}
                        className={`
                          flex items-center justify-center cursor-pointer w-28 h-8 px-6 py-2 font-bold transition border border-smui-dark-surface-3/50 m-2
                          ${saving ? "bg-smui-yellow/80 cursor-not-allowed" : "bg-smui-yellow hover:bg-smui-yellow/80"}
                        `}
                      >
                        {saving ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          "Salvar"
                        )}
                      </button>
                    </div>

                    {hasResult ? (
                      <div className="flex gap-2 w-full items-center justify-start bg-smui-red/50 border-t p-2 border-smui-dark-surface-3/50">
                        <CircleCheckBig /> Resultado salvo!
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full items-center justify-start bg-smui-green/50 border-t p-2 border-smui-dark-surface-3/50">
                        <Save /> Insira o resultado e clique em salvar
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {matches.length === 0 && (
        <div className="text-center flex items-center flex-col text-xl py-12">
          <CircleOff size={100} className="mb-8" />
          <p>Nenhum jogo disponível </p>
        </div>
      )}
    </div>
  );
}
