"use client";

import { useState, useEffect } from "react";

type RankingUser = {
  id: number;
  name: string;
  total_points: number;
  correct_exact: number;
  correct_result: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ranking", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      setRanking(data);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return "📊";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-700 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">
          📊 Carregando ranking...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">🏆 Ranking do Bolão</h1>
          <button
            onClick={() => (window.location.href = "/bets")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            ← Voltar às Apostas
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-400 to-orange-500">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-bold">
                    Posição
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold">
                    Apostador
                  </th>
                  <th className="px-6 py-4 text-center text-white font-bold">
                    🏆 Pontos
                  </th>
                  <th className="px-6 py-4 text-center text-white font-bold">
                    🎯 Placar Exato
                  </th>
                  <th className="px-6 py-4 text-center text-white font-bold">
                    ✅ Resultado Correto
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`
                    border-b border-gray-200 hover:bg-gray-50 transition
                    ${index === 0 ? "bg-yellow-50" : ""}
                    ${index === 1 ? "bg-gray-50" : ""}
                    ${index === 2 ? "bg-orange-50" : ""}
                  `}
                  >
                    <td className="px-6 py-4 font-bold text-lg">
                      <span className="flex items-center gap-2">
                        {getMedal(index)} #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-500 text-white font-bold px-4 py-2 rounded-full">
                        {user.total_points} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {user.correct_exact || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {user.correct_result || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {ranking.length === 0 && (
          <div className="text-center text-white text-xl py-12">
            Nenhuma aposta cadastrada ainda
          </div>
        )}
      </div>
    </div>
  );
}
