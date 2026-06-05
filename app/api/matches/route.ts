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

    const now = new Date();

    // Buscar todos os jogos
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

    // Processar cada jogo - REGRA SIMPLES
    const matchesWithLockStatus = matches.map((match: any) => {
      const matchDate = new Date(match.match_date);
      const hasResult =
        match.official_score_a !== null && match.official_score_b !== null;
      const isFinished = match.is_finished === 1;

      // Só bloqueia se: tem resultado OU está finalizado
      // NÃO bloqueia por data!
      const isLocked = hasResult || isFinished;

      let lockReason = null;
      if (isFinished) lockReason = "Jogo já finalizado";
      else if (hasResult) lockReason = "Resultado oficial já lançado";

      return {
        id: match.id,
        phase: match.phase,
        group_name: match.group_name,
        team_a: match.team_a,
        team_b: match.team_b,
        match_date: match.match_date,
        bet_score_a: match.bet_score_a,
        bet_score_b: match.bet_score_b,
        official_score_a: match.official_score_a,
        official_score_b: match.official_score_b,
        is_finished: match.is_finished,
        can_edit: !isLocked, // TRUE para todos os jogos sem resultado
        lock_reason: lockReason,
      };
    });

    const lockedCount = matchesWithLockStatus.filter(
      (m: any) => !m.can_edit,
    ).length;
    const availableCount = matchesWithLockStatus.filter(
      (m: any) => m.can_edit,
    ).length;

    console.log(`📊 Total: ${matchesWithLockStatus.length} jogos`);
    console.log(`🟢 Liberados: ${availableCount}`);
    console.log(`🔴 Bloqueados (só os que têm resultado): ${lockedCount}`);

    return NextResponse.json(matchesWithLockStatus);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
