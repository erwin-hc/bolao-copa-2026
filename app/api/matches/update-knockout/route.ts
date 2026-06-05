import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "meu-segredo-super-seguro-para-copa-2026";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.is_admin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 },
      );
    }

    console.log("🔄 Atualizando mata-mata...");
    console.log("=".repeat(60));

    // ============================================
    // PASSO 1: Calcular classificação dos grupos
    // ============================================
    const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const groupRankings: { [key: string]: { first: string; second: string } } =
      {};

    console.log("\n📊 Calculando classificação dos grupos...");

    for (const group of groups) {
      const matches = db
        .prepare(
          `
        SELECT team_a, team_b, official_score_a, official_score_b
        FROM matches 
        WHERE phase = 'groups' AND group_name = ? AND official_score_a IS NOT NULL
      `,
        )
        .all(group);

      if (matches.length === 0) {
        console.log(`⚠️ Grupo ${group}: sem resultados - pulando`);
        continue;
      }

      const stats: {
        [team: string]: {
          points: number;
          goalsFor: number;
          goalsAgainst: number;
        };
      } = {};

      for (const match of matches as any[]) {
        if (!stats[match.team_a])
          stats[match.team_a] = { points: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!stats[match.team_b])
          stats[match.team_b] = { points: 0, goalsFor: 0, goalsAgainst: 0 };

        if (match.official_score_a > match.official_score_b) {
          stats[match.team_a].points += 3;
        } else if (match.official_score_b > match.official_score_a) {
          stats[match.team_b].points += 3;
        } else {
          stats[match.team_a].points += 1;
          stats[match.team_b].points += 1;
        }

        stats[match.team_a].goalsFor += match.official_score_a;
        stats[match.team_a].goalsAgainst += match.official_score_b;
        stats[match.team_b].goalsFor += match.official_score_b;
        stats[match.team_b].goalsAgainst += match.official_score_a;
      }

      const sorted = Object.entries(stats).sort((a, b) => {
        if (a[1].points !== b[1].points) return b[1].points - a[1].points;
        const diffA = a[1].goalsFor - a[1].goalsAgainst;
        const diffB = b[1].goalsFor - b[1].goalsAgainst;
        if (diffA !== diffB) return diffB - diffA;
        return b[1].goalsFor - a[1].goalsFor;
      });

      groupRankings[group] = {
        first: sorted[0]?.[0] || "",
        second: sorted[1]?.[0] || "",
      };

      console.log(
        `   Grupo ${group}: 1º ${groupRankings[group].first} | 2º ${groupRankings[group].second}`,
      );
    }

    // ============================================
    // PASSO 2: Atualizar Oitavas
    // ============================================
    console.log("\n🏆 Atualizando Oitavas de Final...");

    const round16Data = [
      {
        pos: 1,
        team_a: groupRankings.A?.first,
        team_b: groupRankings.B?.second,
      },
      {
        pos: 2,
        team_a: groupRankings.C?.first,
        team_b: groupRankings.D?.second,
      },
      {
        pos: 3,
        team_a: groupRankings.E?.first,
        team_b: groupRankings.F?.second,
      },
      {
        pos: 4,
        team_a: groupRankings.G?.first,
        team_b: groupRankings.H?.second,
      },
      {
        pos: 5,
        team_a: groupRankings.B?.first,
        team_b: groupRankings.A?.second,
      },
      {
        pos: 6,
        team_a: groupRankings.D?.first,
        team_b: groupRankings.C?.second,
      },
      {
        pos: 7,
        team_a: groupRankings.F?.first,
        team_b: groupRankings.E?.second,
      },
      {
        pos: 8,
        team_a: groupRankings.H?.first,
        team_b: groupRankings.G?.second,
      },
    ];

    const round16Matches = db
      .prepare(`SELECT id FROM matches WHERE phase = 'round16' ORDER BY id`)
      .all() as { id: number }[];

    for (let i = 0; i < round16Data.length && i < round16Matches.length; i++) {
      if (round16Data[i].team_a && round16Data[i].team_b) {
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(
          round16Data[i].team_a,
          round16Data[i].team_b,
          round16Matches[i].id,
        );
        console.log(
          `   ✅ Jogo ${i + 1}: ${round16Data[i].team_a} vs ${round16Data[i].team_b}`,
        );
      }
    }

    // ============================================
    // PASSO 3: Calcular vencedores das Oitavas
    // ============================================
    console.log("\n🏆 Calculando vencedores das Oitavas...");

    const round16Current = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'round16'
    `,
      )
      .all() as any[];

    const round16Winners: { [id: number]: string } = {};

    for (const match of round16Current) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          round16Winners[match.id] = match.team_a;
          console.log(
            `   ✅ ${match.team_a} venceu ${match.team_b} (${match.official_score_a}-${match.official_score_b})`,
          );
        } else if (match.official_score_b > match.official_score_a) {
          round16Winners[match.id] = match.team_b;
          console.log(
            `   ✅ ${match.team_b} venceu ${match.team_a} (${match.official_score_b}-${match.official_score_a})`,
          );
        } else {
          console.log(
            `   ⚠️ Empate sem pênaltis: ${match.team_a} vs ${match.team_b}`,
          );
        }
      }
    }

    // ============================================
    // PASSO 4: Atualizar Quartas (baseado nos vencedores)
    // ============================================
    console.log("\n🏆 Atualizando Quartas de Final...");

    // Agrupar vencedores das oitavas em pares
    const quarterData = [
      {
        team_a: round16Winners[round16Matches[0]?.id],
        team_b: round16Winners[round16Matches[1]?.id],
      },
      {
        team_a: round16Winners[round16Matches[2]?.id],
        team_b: round16Winners[round16Matches[3]?.id],
      },
      {
        team_a: round16Winners[round16Matches[4]?.id],
        team_b: round16Winners[round16Matches[5]?.id],
      },
      {
        team_a: round16Winners[round16Matches[6]?.id],
        team_b: round16Winners[round16Matches[7]?.id],
      },
    ];

    const quarterMatches = db
      .prepare(`SELECT id FROM matches WHERE phase = 'quarter' ORDER BY id`)
      .all() as { id: number }[];

    for (let i = 0; i < quarterData.length && i < quarterMatches.length; i++) {
      if (quarterData[i].team_a && quarterData[i].team_b) {
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(
          quarterData[i].team_a,
          quarterData[i].team_b,
          quarterMatches[i].id,
        );
        console.log(
          `   ✅ Quartas ${i + 1}: ${quarterData[i].team_a} vs ${quarterData[i].team_b}`,
        );
      }
    }

    // ============================================
    // PASSO 5: Calcular vencedores das Quartas
    // ============================================
    console.log("\n🏆 Calculando vencedores das Quartas...");

    const quarterCurrent = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'quarter'
    `,
      )
      .all() as any[];

    const quarterWinners: { [id: number]: string } = {};

    for (const match of quarterCurrent) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          quarterWinners[match.id] = match.team_a;
          console.log(
            `   ✅ ${match.team_a} venceu ${match.team_b} (${match.official_score_a}-${match.official_score_b})`,
          );
        } else if (match.official_score_b > match.official_score_a) {
          quarterWinners[match.id] = match.team_b;
          console.log(
            `   ✅ ${match.team_b} venceu ${match.team_a} (${match.official_score_b}-${match.official_score_a})`,
          );
        } else {
          console.log(`   ⚠️ Empate: ${match.team_a} vs ${match.team_b}`);
        }
      }
    }

    // ============================================
    // PASSO 6: Atualizar Semifinais
    // ============================================
    console.log("\n🏆 Atualizando Semifinais...");

    const semiData = [
      {
        team_a: quarterWinners[quarterMatches[0]?.id],
        team_b: quarterWinners[quarterMatches[1]?.id],
      },
      {
        team_a: quarterWinners[quarterMatches[2]?.id],
        team_b: quarterWinners[quarterMatches[3]?.id],
      },
    ];

    const semiMatches = db
      .prepare(`SELECT id FROM matches WHERE phase = 'semi' ORDER BY id`)
      .all() as { id: number }[];

    for (let i = 0; i < semiData.length && i < semiMatches.length; i++) {
      if (semiData[i].team_a && semiData[i].team_b) {
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(semiData[i].team_a, semiData[i].team_b, semiMatches[i].id);
        console.log(
          `   ✅ Semi ${i + 1}: ${semiData[i].team_a} vs ${semiData[i].team_b}`,
        );
      }
    }

    // ============================================
    // PASSO 7: Calcular vencedores das Semis
    // ============================================
    console.log("\n🏆 Calculando vencedores das Semifinais...");

    const semiCurrent = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'semi'
    `,
      )
      .all() as any[];

    const semiWinners: { [id: number]: string } = {};
    const semiLosers: string[] = [];

    for (const match of semiCurrent) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          semiWinners[match.id] = match.team_a;
          semiLosers.push(match.team_b);
          console.log(
            `   ✅ ${match.team_a} venceu ${match.team_b} (${match.official_score_a}-${match.official_score_b})`,
          );
        } else if (match.official_score_b > match.official_score_a) {
          semiWinners[match.id] = match.team_b;
          semiLosers.push(match.team_a);
          console.log(
            `   ✅ ${match.team_b} venceu ${match.team_a} (${match.official_score_b}-${match.official_score_a})`,
          );
        }
      }
    }

    // ============================================
    // PASSO 8: Atualizar Final
    // ============================================
    console.log("\n🏆 Atualizando Final...");

    if (semiWinners[semiMatches[0]?.id] && semiWinners[semiMatches[1]?.id]) {
      const finalId = db
        .prepare(`SELECT id FROM matches WHERE phase = 'final' LIMIT 1`)
        .get() as { id: number };
      if (finalId) {
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(
          semiWinners[semiMatches[0].id],
          semiWinners[semiMatches[1].id],
          finalId.id,
        );
        console.log(
          `   ✅ Final: ${semiWinners[semiMatches[0].id]} vs ${semiWinners[semiMatches[1].id]}`,
        );
      }
    }

    // ============================================
    // PASSO 9: Atualizar Terceiro Lugar
    // ============================================
    console.log("\n🏆 Atualizando Terceiro Lugar...");

    if (semiLosers.length >= 2) {
      const thirdId = db
        .prepare(`SELECT id FROM matches WHERE phase = 'third' LIMIT 1`)
        .get() as { id: number };
      if (thirdId) {
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(semiLosers[0], semiLosers[1], thirdId.id);
        console.log(
          `   ✅ Terceiro Lugar: ${semiLosers[0]} vs ${semiLosers[1]}`,
        );
      }
    }

    console.log("\n✅ Mata-mata atualizado com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Mata-mata atualizado dinamicamente com sucesso!",
      data: { groupRankings },
    });
  } catch (error) {
    console.error("Erro detalhado:", error);
    return NextResponse.json(
      {
        error:
          "Erro ao atualizar mata-mata: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    return NextResponse.json({ status: "API funcionando" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
