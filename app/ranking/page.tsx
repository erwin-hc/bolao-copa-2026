"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Users,
  TrendingUp,
  Award,
  User,
  Target,
  HandFist,
} from "lucide-react";
import { useMessages } from "@/providers/message-provider";
import MessageDisplay from "@/components/ui/MessageDisplay";
import { SoccerBallIcon, SoccerMedal } from "../components/svgs";

type RankingUser = {
  id: number;
  name: string;
  total_points: number;
  correct_exact: number;
  correct_result: number;
};

// Componente de Card de Premiação
function PrizeCard({
  totalParticipants,
  participationFee,
}: {
  totalParticipants: number;
  participationFee: number;
}) {
  // const PARTICIPATION_FEE = 50;
  const FIRST_PLACE_PERCENT = 0.7;
  const SECOND_PLACE_PERCENT = 0.3;

  const totalPrize = totalParticipants * participationFee;
  const firstPrize = totalPrize * FIRST_PLACE_PERCENT;
  const secondPrize = totalPrize * SECOND_PLACE_PERCENT;

  return (
    <div className="bg-smui-surface-2 border border-smui-dark-surface-3/50 overflow-hidden">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border border-smui-dark-surface-3/50 bg-smui-red p-3 text-center text-slate-950 flex gap-4">
            <div className="flex flex-col items-center">
              <Trophy size={50} strokeWidth={1} />
              <span className="text-sm font-semibold">1º LUGAR</span>
            </div>
            <div className="flex flex-col p-2">
              <span className="text-3xl font-bold">
                R$ {firstPrize.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs text-slate-700">70% do total</span>
            </div>
          </div>

          <div className="border border-smui-dark-surface-3/50 bg-smui-yellow p-3 text-center text-slate-950 flex gap-4">
            <div className="flex flex-col items-center">
              <Medal size={50} strokeWidth={1} />
              <span className="text-sm font-semibold">2º LUGAR</span>
            </div>
            <div className="flex flex-col p-2">
              <span className="text-3xl font-bold">
                R$ {secondPrize.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs text-slate-700">30% do total</span>
            </div>
          </div>
        </div>

        <div className="sm:flex sm:justify-between mt-3 pt-3 border-t border-smui-dark-surface-3/50 text-xs text-slate-700 gap-2">
          <div className="flex items-center gap-2">
            <Users size={12} />
            <span>{totalParticipants} Apostador(es)</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={12} />
            <span>
              Premiação Total R$ {totalPrize.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={12} />
            <span>Taxa: R$ {participationFee},00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const { addMessage } = useMessages();
  const [participationFee, setParticipationFee] = useState(50);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Dentro de loadData, adicione:
      const settingsRes = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setParticipationFee(settingsData.participationFee);
      }

      const [rankingRes, usersRes] = await Promise.all([
        fetch("/api/ranking", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users/count", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (rankingRes.status === 401 || usersRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const rankingData = await rankingRes.json();
      setRanking(rankingData);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setTotalParticipants(usersData.count);
      } else {
        setTotalParticipants(rankingData.length);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      addMessage("error", "Erro ao carregar ranking");
      if (ranking.length > 0) {
        setTotalParticipants(ranking.length);
      } else {
        setTotalParticipants(2);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-950 min-h-screen bg-smui-surface-3 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl mb-4 animate-bounce">
            <SoccerBallIcon size={50} />
          </div>
          <div className="flex gap-2 ">
            <div className="flex gap-2 items-center">
              <p className="text-xl ">Carregando Ranking</p>
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
    <div className="min-h-screen bg-smui-surface-3">
      <MessageDisplay />

      {/* Header Fixo */}
      <div className="bg-smui-yellow/85 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-2">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-950 flex items-center justify-center gap-2">
                <SoccerMedal size={50} /> Ranking do Bolão
              </h1>
            </div>
            <button
              onClick={() => (window.location.href = "/bets")}
              className="cursor-pointer w-28 h-8 bg-smui-green hover:bg-smui-green/80 text-slate-950 font-semibold px-4 py-1 rounded-lg transition border border-smui-dark-surface-3/50 flex items-center gap-2 justify-center"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto p-4">
        {/* Card de Premiação */}
        <div className="mb-4">
          <PrizeCard
            participationFee={participationFee}
            totalParticipants={totalParticipants}
          />
        </div>

        {/* Tabela de Ranking - Responsiva */}
        <div className="bg-smui-surface-1 overflow-hidden border border-smui-dark-surface-3/50">
          {/* Versão Desktop: Tabela tradicional */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-slate-950">
              <thead className="bg-smui-green">
                <tr>
                  <th className="font-bold p-2">
                    <div className="flex items-center justify-start gap-2">
                      <Award size={16} /> Posição
                    </div>
                  </th>
                  <th className="font-bold p-2">
                    <div className="flex items-center justify-start gap-2">
                      <User size={16} /> Apostador
                    </div>
                  </th>
                  <th className="font-bold p-2">
                    <div className="flex items-center justify-start gap-2">
                      <Trophy size={16} /> Pontos
                    </div>
                  </th>
                  <th className="font-bold p-2">
                    <div className="flex items-center justify-start gap-2">
                      <Target size={16} /> Placar Exato
                    </div>
                  </th>
                  <th className="font-bold p-2">
                    <div className="flex items-center justify-start gap-2">
                      <HandFist size={16} /> Vitória
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-smui-dark-surface-3/50"
                  >
                    <td className="p-2 font-bold">#{index + 1}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">
                      <span className="bg-smui-green font-bold px-3 py-1 rounded-full text-sm">
                        {user.total_points} pts
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="bg-smui-frost-4/20 text-smui-frost-4 font-bold px-3 py-1 rounded-full text-sm">
                        {user.correct_exact}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="bg-smui-purple/20 text-smui-purple font-bold px-3 py-1 rounded-full text-sm">
                        {user.correct_result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão Mobile: Cards */}
          <div className="md:hidden space-y-3 p-3 text-slate-950">
            {ranking.map((user, index) => (
              <div
                key={user.id}
                className="bg-smui-surface-2 rounded-lg p-3 border border-smui-dark-surface-3/50"
              >
                {/* Header do card */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-smui-green" />
                    <span className="font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div className="text-sm font-semibold">{user.name}</div>
                </div>

                {/* Stats do card - Grid 3 colunas */}
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <div className="bg-smui-green/20 rounded-lg p-2 border border-smui-dark-surface-3/50">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy size={12} />
                      <span className="text-xs text-slate-950">Pontos</span>
                    </div>
                    <div className="font-bold text-2xl">
                      {user.total_points}
                    </div>
                  </div>
                  <div className="bg-smui-frost-4/20 rounded-lg p-2 border border-smui-dark-surface-3/50">
                    <div className="flex items-center justify-center gap-1">
                      <Target size={12} />
                      <span className="text-xs text-slate-950">Exato</span>
                    </div>
                    <div className="font-bold text-2xl">
                      {user.correct_exact}
                    </div>
                  </div>
                  <div className="bg-smui-purple/20 rounded-lg p-2 border border-smui-dark-surface-3/50">
                    <div className="flex items-center justify-center gap-1">
                      <HandFist size={12} />
                      <span className="text-xs text-slate-950">Vitória</span>
                    </div>
                    <div className="font-bold text-2xl">
                      {user.correct_result}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ranking.length === 0 && (
          <div className="text-center text-slate-500 text-xl py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p>Nenhuma aposta cadastrada ainda</p>
            <p className="text-sm mt-2">
              Faça suas apostas para aparecer no ranking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
