"use client";

import { useEffect } from "react";

export default function Redirecting({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-bounce">⚽</div>
        <h2 className="text-2xl font-bold mb-2">Redirecionando...</h2>
        <p className="text-green-200">Aguarde um momento</p>
      </div>
    </div>
  );
}
