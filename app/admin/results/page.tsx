"use client";

import { useState, useEffect } from "react";

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

      // ORDENAÇÃO CORRIGIDA: por data, depois por grupo, depois por horário
      const sortedData = [...data].sort((a, b) => {
        // 1. Primeiro ordenar por data
        const dateA = new Date(a.match_date).getTime();
        const dateB = new Date(b.match_date).getTime();

        if (dateA !== dateB) {
          return dateA - dateB;
        }

        // 2. Mesma data: ordenar por grupo (A, B, C, D, E, F, G, H)
        // Grupos vêm primeiro (A, B, C...), depois mata-mata (sem grupo)
        if (a.group_name && b.group_name) {
          const groupCompare = a.group_name.localeCompare(b.group_name);
          if (groupCompare !== 0) return groupCompare;
        }

        // 3. Se um tem grupo e outro não (mata-mata), grupos vêm primeiro
        if (a.group_name && !b.group_name) return -1;
        if (!a.group_name && b.group_name) return 1;

        // 4. Mesma data e mesma fase: ordenar por horário
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
        setSavedMatchId(matchId);
        await fetchMatches();
        setTimeout(() => setSavedMatchId(null), 2000);
      } else {
        setError(data.error || "Erro ao salvar resultado");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o servidor");
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

  // Agrupar jogos por data
  const groupMatchesByDate = () => {
    const grouped: { [date: string]: Match[] } = {};

    matches.forEach((match) => {
      const dateKey = new Date(match.match_date).toLocaleDateString("pt-BR");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });

    // Ordenar os jogos dentro de cada data
    for (const date in grouped) {
      grouped[date].sort((a, b) => {
        // Primeiro por grupo (A, B, C...)
        if (a.group_name && b.group_name) {
          const groupCompare = a.group_name.localeCompare(b.group_name);
          if (groupCompare !== 0) return groupCompare;
        }
        // Depois por horário
        return (
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        );
      });
    }

    return grouped;
  };

  const groupedMatches = groupMatchesByDate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">📋 Carregando jogos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              📋 Resultados Oficiais - Admin
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Digite os placares reais dos jogos. Os pontos serão calculados
              automaticamente.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                if (
                  !confirm(
                    "🔄 Isso irá atualizar automaticamente o chaveamento do mata-mata baseado nos resultados dos grupos.\n\nContinuar?",
                  )
                )
                  return;

                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await fetch("/api/matches/update-knockout", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.ok) {
                  alert("✅ " + data.message);
                  await fetchMatches();
                } else {
                  alert("❌ " + data.error);
                }
                setLoading(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              🔄 Atualizar Mata-Mata
            </button>
            <button
              onClick={() => (window.location.href = "/bets")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              ← Voltar às Apostas
            </button>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Lista de jogos agrupados por data */}
        {Object.entries(groupedMatches)
          .sort(([dateA], [dateB]) => {
            // Ordenar as datas (mais antigas primeiro)
            const [dayA, monthA, yearA] = dateA.split("/");
            const [dayB, monthB, yearB] = dateB.split("/");
            const dateObjA = new Date(`${yearA}-${monthA}-${dayA}`);
            const dateObjB = new Date(`${yearB}-${monthB}-${dayB}`);
            return dateObjA.getTime() - dateObjB.getTime();
          })
          .map(([date, dateMatches]) => (
            <div key={date} className="mb-8">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-400/30 pb-2">
                📅 {date}
              </h2>
              <div className="grid gap-4">
                {dateMatches.map((match) => {
                  const values = editValues[match.id] || { a: "", b: "" };
                  const hasResult = match.official_score_a !== null;

                  return (
                    <div
                      key={match.id}
                      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                    >
                      {/* Cabeçalho */}
                      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400">
                            {new Date(match.match_date).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                            {getPhaseName(match.phase)}
                          </span>
                          {match.group_name && (
                            <span className="text-xs px-2 py-1 bg-blue-200 rounded font-bold">
                              Grupo {match.group_name}
                            </span>
                          )}
                        </div>
                        {hasResult && savedMatchId !== match.id && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                            ✓ Resultado: {match.official_score_a} x{" "}
                            {match.official_score_b}
                          </span>
                        )}
                        {savedMatchId === match.id && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                            ✅ Salvo! Pontos recalculados
                          </span>
                        )}
                      </div>

                      {/* Placar */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                          <div className="text-white font-bold text-lg mb-2">
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
                            className="w-24 mx-auto text-center text-2xl font-bold bg-white text-gray-900 border-2 border-gray-600 focus:border-blue-500 rounded-lg p-2"
                            placeholder="?"
                          />
                        </div>

                        <div className="text-2xl font-bold text-gray-500">
                          VS
                        </div>

                        <div className="flex-1 text-center">
                          <div className="text-white font-bold text-lg mb-2">
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
                            className="w-24 mx-auto text-center text-2xl font-bold bg-white text-gray-900 border-2 border-gray-600 focus:border-blue-500 rounded-lg p-2"
                            placeholder="?"
                          />
                        </div>
                      </div>

                      {/* Botão */}
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => saveResult(match.id)}
                          disabled={saving}
                          className={`
                            px-6 py-2 rounded-lg font-bold transition
                            ${saving ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}
                          `}
                        >
                          {saving ? "💾 Salvando..." : "💾 Salvar Resultado"}
                        </button>
                      </div>

                      {hasResult && (
                        <div className="mt-3 text-center text-yellow-400 text-xs">
                          ⚠️ Se você alterar o resultado, os pontos serão
                          recalculados automaticamente.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {matches.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            Nenhum jogo encontrado.
          </div>
        )}

        {saving && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            🔄 Calculando pontos...
          </div>
        )}
      </div>
    </div>
  );
}
