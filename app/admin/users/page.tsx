"use client";

import { useState, useEffect } from "react";
import { useMessages } from "@/providers/message-provider";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  User,
  Mail,
  Lock,
  Shield,
} from "lucide-react";
import { SoccerBallIcon } from "@/app/components/svgs";

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: number;
  created_at: string;
  total_points: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    is_admin: false,
  });
  const { addMessage } = useMessages();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        addMessage("error", "Acesso negado. Apenas administradores.");
        window.location.href = "/bets";
        return;
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      addMessage("error", "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", is_admin: false });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      is_admin: user.is_admin === 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      addMessage("warning", "Nome e email são obrigatórios");
      return;
    }

    if (!editingUser && !formData.password) {
      addMessage("warning", "Senha é obrigatória para novo usuário");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingUser ? "/api/admin/users" : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser ? { id: editingUser.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        addMessage("success", data.message);
        setShowModal(false);
        fetchUsers();
      } else {
        addMessage("error", data.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao salvar usuário");
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Tem certeza que deseja remover o usuário "${user.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        addMessage("success", data.message);
        fetchUsers();
      } else {
        addMessage("error", data.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      addMessage("error", "Erro ao remover usuário");
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
              <p className="text-xl ">Carregando Usuários</p>
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
              <Users size={28} /> Gerenciar Usuários
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Adicione, edite ou remova apostadores do bolão
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/admin/results")}
              className="bg-smui-frost-4 hover:bg-smui-frost-4/80 text-white px-4 py-2 rounded-lg transition"
            >
              ← Voltar
            </button>
            <button
              onClick={openCreateModal}
              className="bg-smui-green hover:bg-smui-green/80 text-slate-950 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus size={18} /> Novo Usuário
            </button>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-smui-surface-1 rounded-lg overflow-hidden border border-smui-dark-surface-3/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-smui-green">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Pontos</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-smui-dark-surface-3/50 hover:bg-smui-surface-2 transition"
                  >
                    <td className="p-3">#{user.id}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-sm">{user.email}</td>
                    <td className="p-3 text-center">
                      {user.is_admin === 1 ? (
                        <span className="bg-smui-purple/20 text-smui-purple px-2 py-1 rounded-full text-xs">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full text-xs">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {user.total_points} pts
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="bg-smui-yellow/20 hover:bg-smui-yellow/40 text-smui-yellow p-1.5 rounded transition"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="bg-smui-red/20 hover:bg-smui-red/40 text-smui-red p-1.5 rounded transition"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum usuário cadastrado</p>
            <button
              onClick={openCreateModal}
              className="mt-3 bg-smui-green text-slate-950 px-4 py-2 rounded-lg"
            >
              Adicionar primeiro usuário
            </button>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-smui-surface-1 rounded-xl max-w-md w-full border border-smui-dark-surface-3/50">
            <div className="p-5 border-b border-smui-dark-surface-3/50 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-smui-surface-2 p-1 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-smui-surface-2 border border-smui-dark-surface-3/50 rounded-lg focus:outline-none focus:border-smui-green"
                    placeholder="Nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-smui-surface-2 border border-smui-dark-surface-3/50 rounded-lg focus:outline-none focus:border-smui-green"
                    placeholder="usuario@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {editingUser ? "Nova Senha (opcional)" : "Senha"}
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-smui-surface-2 border border-smui-dark-surface-3/50 rounded-lg focus:outline-none focus:border-smui-green"
                    placeholder={
                      editingUser
                        ? "Deixe em branco para manter a senha"
                        : "********"
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) =>
                    setFormData({ ...formData, is_admin: e.target.checked })
                  }
                  className="w-4 h-4 accent-smui-green"
                />
                <label
                  htmlFor="is_admin"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Shield size={16} /> Usuário Administrador
                </label>
              </div>
            </div>

            <div className="p-5 border-t border-smui-dark-surface-3/50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-smui-green hover:bg-smui-green/80 text-slate-950 rounded-lg transition flex items-center gap-2"
              >
                <Save size={16} />
                {editingUser ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
