import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    console.log("=== Verificando permissão de edição ===");

    // 1. Aguardar os parâmetros (NOVO: precisa usar await)
    const { matchId } = await params;
    console.log("Match ID:", matchId);

    // 2. Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    // 3. Verificar se o jogo pode ser editado
    const match = db
      .prepare(
        `
      SELECT 
        id,
        match_date,
        is_finished,
        official_score_a,
        official_score_b,
        CASE 
          WHEN datetime(match_date) < datetime('now') THEN 1
          ELSE 0
        END as is_past
      FROM matches 
      WHERE id = ?
    `,
      )
      .get(parseInt(matchId)) as any;

    if (!match) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 },
      );
    }

    // Determinar se pode editar
    const hasResult =
      match.official_score_a !== null && match.official_score_b !== null;
    const isPast = match.is_past === 1;
    const isFinished = match.is_finished === 1;

    const canEdit = !isFinished && !hasResult && !isPast;

    let reason = null;
    if (isFinished) reason = "Jogo já finalizado";
    else if (hasResult) reason = "Resultado oficial já lançado";
    else if (isPast) reason = "Data do jogo já passou";

    console.log(`Jogo ${matchId}: canEdit=${canEdit}, reason=${reason}`);

    return NextResponse.json({
      canEdit,
      reason,
      matchDate: match.match_date,
      isFinished,
      hasResult,
      isPast,
    });
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
