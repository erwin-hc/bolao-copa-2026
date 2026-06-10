"use client";

import { useState, useEffect } from "react";
import { useMessages } from "@/providers/message-provider";
import { Settings, DollarSign, Save, RefreshCw } from "lucide-react";
import { SoccerBallIcon } from "@/app/components/svgs";

export default function AdminSettingsPage() {
  const [participationFee, setParticipationFee] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addMessage } = useMessages();

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        addMessage("error", "Acesso negado. Apenas administradores.");
        window.location.href = "/bets";
        return;
      }

      const data = await response.json();
      setParticipationFee(data.participationFee || 50);
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (participationFee < 0) {
      addMessage("warning", "O valor não pode ser negativo");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participationFee }),
      });

      const data = await response.json();

      if (response.ok) {
        addMessage("success", data.message);
      } else {
        addMessage("error", data.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao salvar configurações");
    } finally {
      setSaving(false);
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
              <p className="text-xl ">Carregando Configurações</p>
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
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings size={28} /> Configurações do Bolão
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie as configurações gerais do sistema
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/admin/results")}
              className="bg-smui-frost-4 hover:bg-smui-frost-4/80 text-white px-4 py-2 rounded-lg transition"
            >
              ← Voltar
            </button>
          </div>
        </div>

        {/* Card de Configurações */}
        <div className="max-w-md">
          <div className="bg-smui-surface-1 rounded-lg border border-smui-dark-surface-3/50 overflow-hidden">
            <div className="p-4 border-b border-smui-dark-surface-3/50 bg-smui-green">
              <h2 className="font-bold flex items-center gap-2">
                <DollarSign size={18} /> Taxa de Participação
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Valor por apostador (R$)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={participationFee}
                      onChange={(e) =>
                        setParticipationFee(parseInt(e.target.value) || 0)
                      }
                      className="w-full pl-8 pr-3 py-2 bg-smui-surface-2 border border-smui-dark-surface-3/50 rounded-lg focus:outline-none focus:border-smui-green"
                      placeholder="Valor em reais"
                    />
                  </div>
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-smui-green hover:bg-smui-green/80 text-slate-950 px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Salvar
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Este valor será multiplicado pelo número de apostadores para
                  calcular a premiação total
                </p>
              </div>

              <div className="bg-smui-surface-2 rounded-lg p-3">
                <div className="text-sm text-slate-600">
                  <strong>Informação:</strong> A premiação total é calculada
                  como:
                </div>
                <div className="text-sm font-mono mt-2 text-center">
                  Total = {participationFee} × Nº de Apostadores
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  • 1º lugar: 70% do total
                  <br />• 2º lugar: 30% do total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
