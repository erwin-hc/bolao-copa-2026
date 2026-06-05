"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SoccerBallIcon, SoccerPlayerAvatarIcon } from "../components/svgs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verificar se já está logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Usuário já logado, redirecionando...");
      window.location.href = "/bets";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar dados
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Login OK, redirecionando...");

        // Redirecionar imediatamente
        window.location.href = "/bets";
      } else {
        setError(data.error || "Erro ao fazer login");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setEmail("teste@teste.com");
    setPassword("123456");
  };

  return (
    <div className="min-h-dvh bg-smui-surface-2 text-slate-950 flex items-center justify-center p-4">
      <div className="p-8 max-w-md w-full border border-smui-dark-surface-3/50">
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center justify-center">
            <SoccerPlayerAvatarIcon strokeColor="#4a4e51" size={100} />
          </div>
          <div className="flex gap-3">
            <SoccerBallIcon size={30} />
            <h1 className=" text-xl uppercase font-mono font-semibold  text-slate-950">
              Bolão Copa 2026
            </h1>
            <SoccerBallIcon size={30} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-950 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-slate-950 w-full px-4 py-2 border border-smui-dark-surface-3/50 focus:outline-none focus:border-smui-green focus:ring-2 focus:ring-smui-green"
              required
              disabled={loading}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-slate-950 font-semibold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-slate-950 w-full px-4 py-2 border border-smui-dark-surface-3/50 focus:outline-none focus:border-smui-green focus:ring-2 focus:ring-smui-green"
              required
              disabled={loading}
              placeholder="********"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full font-bold py-2 px-4 rounded-lg transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-smui-green hover:bg-smui-green"
              }
            `}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleTestLogin}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Preencher dados de teste
          </button>
        </div>

        {/* <p className="text-center mt-4 text-gray-600">
          Não tem cadastro?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-green-600 hover:underline font-semibold"
          >
            Cadastre-se
          </button>
        </p> */}
      </div>
    </div>
  );
}
