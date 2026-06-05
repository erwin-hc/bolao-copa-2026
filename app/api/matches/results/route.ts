import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

// Função para calcular pontos
function calculatePoints(
  betA: number,
  betB: number,
  actualA: number,
  actualB: number,
): { points: number; isExact: boolean; isCorrectResult: boolean } {
  let points = 0;
  let isExact = false;
  let isCorrectResult = false;

  // Placar exato
  if (betA === actualA && betB === actualB) {
    points = 5;
    isExact = true;
    isCorrectResult = true;
  }
  // Resultado correto (vitória/empate)
  else {
    const betResult = Math.sign(betA - betB);
    const actualResult = Math.sign(actualA - actualB);

    if (betResult === actualResult) {
      points = 3;
      isCorrectResult = true;
    }
  }

  return { points, isExact, isCorrectResult };
}

// Função para recalcular todas as estatísticas de um usuário
function recalculateUserStats(userId: number) {
  const bets = db
    .prepare(
      `
    SELECT 
      b.bet_score_a,
      b.bet_score_b,
      m.official_score_a,
      m.official_score_b
    FROM bets b
    JOIN matches m ON b.match_id = m.id
    WHERE b.user_id = ? AND m.official_score_a IS NOT NULL
  `,
    )
    .all(userId) as any[];

  let totalPoints = 0;
  let correctExact = 0;
  let correctResult = 0;

  for (const bet of bets) {
    const { points, isExact, isCorrectResult } = calculatePoints(
      bet.bet_score_a,
      bet.bet_score_b,
      bet.official_score_a,
      bet.official_score_b,
    );

    totalPoints += points;
    if (isExact) correctExact++;
    if (isCorrectResult) correctResult++;
  }

  db.prepare(
    `
    INSERT INTO ranking (user_id, total_points, correct_exact, correct_result)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      total_points = excluded.total_points,
      correct_exact = excluded.correct_exact,
      correct_result = excluded.correct_result
  `,
  ).run(userId, totalPoints, correctExact, correctResult);

  return { totalPoints, correctExact, correctResult };
}

// GET - Buscar jogos com resultados
export async function GET(request: Request) {
  try {
    console.log("=== GET /api/matches/results ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const matches = db
      .prepare(
        `
      SELECT 
        id, phase, group_name, team_a, team_b, 
        match_date, official_score_a, official_score_b, is_finished
      FROM matches 
      ORDER BY match_date ASC
    `,
      )
      .all();

    console.log(`✅ Retornando ${matches.length} jogos`);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Erro no GET:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Salvar/Atualizar resultado
export async function POST(request: Request) {
  try {
    console.log("=== POST /api/matches/results ===");

    // 1. Verificar token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verificado");

    // 2. Ler o corpo da requisição
    const body = await request.json();
    console.log("📦 Dados recebidos:", body);

    const { matchId, scoreA, scoreB } = body;

    if (!matchId || scoreA === undefined || scoreB === undefined) {
      return NextResponse.json(
        {
          error: "Dados incompletos. Envie matchId, scoreA e scoreB",
        },
        { status: 400 },
      );
    }

    // 3. Verificar se o jogo existe
    const match = db
      .prepare("SELECT id FROM matches WHERE id = ?")
      .get(matchId);
    if (!match) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 },
      );
    }

    // 4. Atualizar resultado
    console.log(`📝 Atualizando jogo ${matchId}: ${scoreA} x ${scoreB}`);
    db.prepare(
      `
      UPDATE matches 
      SET official_score_a = ?, official_score_b = ?, is_finished = 1
      WHERE id = ?
    `,
    ).run(scoreA, scoreB, matchId);

    // 5. Buscar apostas deste jogo
    const bets = db
      .prepare(
        `
      SELECT user_id, bet_score_a, bet_score_b 
      FROM bets WHERE match_id = ?
    `,
      )
      .all(matchId);

    console.log(`📊 Encontradas ${bets.length} apostas para calcular`);

    // 6. Atualizar pontos das apostas e recalcular ranking
    const updatedUsers = new Set<number>();

    for (const bet of bets as any[]) {
      const { points } = calculatePoints(
        bet.bet_score_a,
        bet.bet_score_b,
        scoreA,
        scoreB,
      );

      db.prepare(
        `
        UPDATE bets SET points = ? 
        WHERE user_id = ? AND match_id = ?
      `,
      ).run(points, bet.user_id, matchId);

      updatedUsers.add(bet.user_id);
    }

    // 7. Recalcular ranking de todos os usuários afetados
    for (const userId of updatedUsers) {
      const stats = recalculateUserStats(userId);
      console.log(`👤 Usuário ${userId}: ${stats.totalPoints} pontos`);
    }

    console.log(`✅ Resultado salvo com sucesso!`);

    return NextResponse.json({
      success: true,
      message: `Resultado ${scoreA} x ${scoreB} salvo e ${bets.length} apostas calculadas`,
      data: { matchId, scoreA, scoreB, betsProcessed: bets.length },
    });
  } catch (error) {
    console.error("❌ Erro no POST:", error);
    return NextResponse.json(
      {
        error: "Erro interno ao salvar resultado",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

// DELETE - Remover resultado (opcional)
export async function DELETE(request: Request) {
  try {
    console.log("=== DELETE /api/matches/results ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const url = new URL(request.url);
    const matchId = url.searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId não fornecido" },
        { status: 400 },
      );
    }

    // Remover resultado
    db.prepare(
      `
      UPDATE matches 
      SET official_score_a = NULL, official_score_b = NULL, is_finished = 0
      WHERE id = ?
    `,
    ).run(matchId);

    // Zerar pontos das apostas
    db.prepare(`UPDATE bets SET points = 0 WHERE match_id = ?`).run(matchId);

    // Recalcular ranking de todos os usuários
    const users = db.prepare("SELECT id FROM users").all();
    for (const user of users as any[]) {
      recalculateUserStats(user.id);
    }

    console.log(`✅ Resultado removido do jogo ${matchId}`);

    return NextResponse.json({
      success: true,
      message: "Resultado removido e pontos recalculados",
    });
  } catch (error) {
    console.error("Erro no DELETE:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
