import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "seu-segredo-aqui-mude-em-producao";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    // Buscar ranking atualizado
    const ranking = db
      .prepare(
        `
      SELECT 
        u.id,
        u.name,
        COALESCE(r.total_points, 0) as total_points,
        COALESCE(r.correct_exact, 0) as correct_exact,
        COALESCE(r.correct_result, 0) as correct_result
      FROM users u
      LEFT JOIN ranking r ON u.id = r.user_id
      ORDER BY total_points DESC
    `,
      )
      .all();

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
