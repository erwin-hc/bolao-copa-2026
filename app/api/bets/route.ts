import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

export async function POST(request: Request) {
  try {
    console.log("=== Salvando Aposta ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { matchId, scoreA, scoreB } = await request.json();

    if (!matchId || scoreA === undefined || scoreB === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Buscar dados do jogo
    const match = db
      .prepare(
        `
      SELECT id, official_score_a, official_score_b, is_finished, match_date
      FROM matches 
      WHERE id = ?
    `,
      )
      .get(matchId) as any;

    if (!match) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 },
      );
    }

    const now = new Date();
    const matchDate = new Date(match.match_date);

    console.log(`Jogo ${matchId}:`);
    console.log(`  Data do jogo: ${match.match_date}`);
    console.log(`  Data atual: ${now.toLocaleString("pt-BR")}`);
    console.log(`  Jogo já passou? ${matchDate < now}`);
    console.log(`  Tem resultado? ${match.official_score_a !== null}`);

    // REGRAS DE BLOQUEIO (APENAS ESTAS):
    // 1. Se já tem resultado oficial
    if (match.official_score_a !== null && match.official_score_b !== null) {
      return NextResponse.json(
        {
          error: "❌ Resultado oficial já foi lançado para este jogo",
        },
        { status: 403 },
      );
    }

    // 2. Se o jogo já foi finalizado
    if (match.is_finished === 1) {
      return NextResponse.json(
        {
          error: "❌ Jogo já foi finalizado",
        },
        { status: 403 },
      );
    }

    // 3. Só bloqueia por data se o jogo já PASSOU (não 1 dia antes)
    if (matchDate < now) {
      return NextResponse.json(
        {
          error: "❌ Jogo já aconteceu",
        },
        { status: 403 },
      );
    }

    // Salvar aposta (permitido!)
    const stmt = db.prepare(`
      INSERT INTO bets (user_id, match_id, bet_score_a, bet_score_b, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, match_id) 
      DO UPDATE SET 
        bet_score_a = excluded.bet_score_a,
        bet_score_b = excluded.bet_score_b,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(userId, matchId, scoreA, scoreB);

    console.log(`✅ Aposta salva - Jogo ${matchId}: ${scoreA}x${scoreB}`);

    return NextResponse.json({
      success: true,
      message: "✅ Aposta salva com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao salvar aposta:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar aposta" },
      { status: 500 },
    );
  }
}

// GET para buscar apostas do usuário
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const bets = db
      .prepare(
        `
      SELECT match_id, bet_score_a, bet_score_b 
      FROM bets 
      WHERE user_id = ?
    `,
      )
      .all(userId);

    return NextResponse.json(bets);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
