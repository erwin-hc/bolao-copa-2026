import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

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
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Buscar jogos (SEM verificação de data no servidor)
    const matches = db
      .prepare(
        `
      SELECT 
        m.*,
        b.bet_score_a,
        b.bet_score_b,
        m.official_score_a,
        m.official_score_b,
        m.is_finished,
        m.match_date
      FROM matches m
      LEFT JOIN bets b ON m.id = b.match_id AND b.user_id = ?
      ORDER BY 
        CASE m.phase
          WHEN 'groups' THEN 1
          WHEN 'round16' THEN 2
          WHEN 'quarter' THEN 3
          WHEN 'semi' THEN 4
          WHEN 'third' THEN 5
          WHEN 'final' THEN 6
        END,
        m.match_date ASC
    `,
      )
      .all(userId);

    // Retornar os dados brutos (sem processamento de data)
    // A verificação será feita no frontend
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
