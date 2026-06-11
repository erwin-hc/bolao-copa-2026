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

    console.log("🔄 Atualizando mata-mata automaticamente...");
    console.log("=".repeat(60));

    // 1. Buscar classificação dos grupos
    const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const groupRankings: { [key: string]: { first: string; second: string } } =
      {};

    console.log("📊 Calculando classificação dos grupos...");

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
        console.log(`⚠️ Grupo ${group}: sem resultados ainda`);
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

    // 2. Atualizar Oitavas
    console.log("\n🏆 Atualizando Oitavas de Final...");

    const round16Data = [
      { team_a: groupRankings.A?.first, team_b: groupRankings.B?.second },
      { team_a: groupRankings.C?.first, team_b: groupRankings.D?.second },
      { team_a: groupRankings.E?.first, team_b: groupRankings.F?.second },
      { team_a: groupRankings.G?.first, team_b: groupRankings.H?.second },
      { team_a: groupRankings.B?.first, team_b: groupRankings.A?.second },
      { team_a: groupRankings.D?.first, team_b: groupRankings.C?.second },
      { team_a: groupRankings.F?.first, team_b: groupRankings.E?.second },
      { team_a: groupRankings.H?.first, team_b: groupRankings.G?.second },
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
          `   ✅ Oitava ${i + 1}: ${round16Data[i].team_a} vs ${round16Data[i].team_b}`,
        );
      }
    }

    // 3. Buscar vencedores das Oitavas
    const round16Current = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'round16' AND official_score_a IS NOT NULL
    `,
      )
      .all() as any[];

    const round16Winners: { [key: string]: string } = {};

    for (const match of round16Current) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          round16Winners[`${match.team_a} vs ${match.team_b}`] = match.team_a;
          console.log(`   ✅ Oitava: ${match.team_a} venceu ${match.team_b}`);
        } else if (match.official_score_b > match.official_score_a) {
          round16Winners[`${match.team_a} vs ${match.team_b}`] = match.team_b;
          console.log(`   ✅ Oitava: ${match.team_b} venceu ${match.team_a}`);
        }
      }
    }

    // 4. Atualizar Quartas
    console.log("\n🏆 Atualizando Quartas de Final...");

    const allRound16 = db
      .prepare(
        `
      SELECT team_a, team_b FROM matches WHERE phase = 'round16' ORDER BY id
    `,
      )
      .all() as any[];

    const quarterData = [
      {
        team_a:
          round16Winners[
            `${allRound16[0]?.team_a} vs ${allRound16[0]?.team_b}`
          ] || allRound16[0]?.team_a,
        team_b:
          round16Winners[
            `${allRound16[1]?.team_a} vs ${allRound16[1]?.team_b}`
          ] || allRound16[1]?.team_a,
      },
      {
        team_a:
          round16Winners[
            `${allRound16[2]?.team_a} vs ${allRound16[2]?.team_b}`
          ] || allRound16[2]?.team_a,
        team_b:
          round16Winners[
            `${allRound16[3]?.team_a} vs ${allRound16[3]?.team_b}`
          ] || allRound16[3]?.team_a,
      },
      {
        team_a:
          round16Winners[
            `${allRound16[4]?.team_a} vs ${allRound16[4]?.team_b}`
          ] || allRound16[4]?.team_a,
        team_b:
          round16Winners[
            `${allRound16[5]?.team_a} vs ${allRound16[5]?.team_b}`
          ] || allRound16[5]?.team_a,
      },
      {
        team_a:
          round16Winners[
            `${allRound16[6]?.team_a} vs ${allRound16[6]?.team_b}`
          ] || allRound16[6]?.team_a,
        team_b:
          round16Winners[
            `${allRound16[7]?.team_a} vs ${allRound16[7]?.team_b}`
          ] || allRound16[7]?.team_a,
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

    // 5. Buscar vencedores das Quartas
    const quarterCurrent = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'quarter' AND official_score_a IS NOT NULL
    `,
      )
      .all() as any[];

    const quarterWinners: { [key: string]: string } = {};

    for (const match of quarterCurrent) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          quarterWinners[`${match.team_a} vs ${match.team_b}`] = match.team_a;
          console.log(`   ✅ Quartas: ${match.team_a} venceu ${match.team_b}`);
        } else if (match.official_score_b > match.official_score_a) {
          quarterWinners[`${match.team_a} vs ${match.team_b}`] = match.team_b;
          console.log(`   ✅ Quartas: ${match.team_b} venceu ${match.team_a}`);
        }
      }
    }

    // 6. Atualizar Semifinais
    console.log("\n🏆 Atualizando Semifinais...");

    const allQuarter = db
      .prepare(
        `
      SELECT team_a, team_b FROM matches WHERE phase = 'quarter' ORDER BY id
    `,
      )
      .all() as any[];

    const semiData = [
      {
        team_a:
          quarterWinners[
            `${allQuarter[0]?.team_a} vs ${allQuarter[0]?.team_b}`
          ] || allQuarter[0]?.team_a,
        team_b:
          quarterWinners[
            `${allQuarter[1]?.team_a} vs ${allQuarter[1]?.team_b}`
          ] || allQuarter[1]?.team_a,
      },
      {
        team_a:
          quarterWinners[
            `${allQuarter[2]?.team_a} vs ${allQuarter[2]?.team_b}`
          ] || allQuarter[2]?.team_a,
        team_b:
          quarterWinners[
            `${allQuarter[3]?.team_a} vs ${allQuarter[3]?.team_b}`
          ] || allQuarter[3]?.team_a,
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

    // 7. Buscar vencedores e perdedores das Semis
    const semiCurrent = db
      .prepare(
        `
      SELECT id, team_a, team_b, official_score_a, official_score_b 
      FROM matches WHERE phase = 'semi' AND official_score_a IS NOT NULL
    `,
      )
      .all() as any[];

    const semiWinners: { [key: string]: string } = {};
    const semiLosers: string[] = [];

    for (const match of semiCurrent) {
      if (match.official_score_a !== null && match.official_score_b !== null) {
        if (match.official_score_a > match.official_score_b) {
          semiWinners[`${match.team_a} vs ${match.team_b}`] = match.team_a;
          semiLosers.push(match.team_b);
          console.log(`   ✅ Semi: ${match.team_a} venceu ${match.team_b}`);
        } else if (match.official_score_b > match.official_score_a) {
          semiWinners[`${match.team_a} vs ${match.team_b}`] = match.team_b;
          semiLosers.push(match.team_a);
          console.log(`   ✅ Semi: ${match.team_b} venceu ${match.team_a}`);
        }
      }
    }

    // 8. Atualizar Final (vencedores)
    console.log("\n🏆 Atualizando Final...");

    const allSemi = db
      .prepare(
        `
      SELECT team_a, team_b FROM matches WHERE phase = 'semi' ORDER BY id
    `,
      )
      .all() as any[];

    const finalMatch = [
      {
        team_a:
          semiWinners[`${allSemi[0]?.team_a} vs ${allSemi[0]?.team_b}`] ||
          allSemi[0]?.team_a,
        team_b:
          semiWinners[`${allSemi[1]?.team_a} vs ${allSemi[1]?.team_b}`] ||
          allSemi[1]?.team_a,
      },
    ];

    const finalId = db
      .prepare(`SELECT id FROM matches WHERE phase = 'final' LIMIT 1`)
      .get() as { id: number };
    if (finalId && finalMatch[0].team_a && finalMatch[0].team_b) {
      db.prepare(`UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`).run(
        finalMatch[0].team_a,
        finalMatch[0].team_b,
        finalId.id,
      );
      console.log(
        `   ✅ Final: ${finalMatch[0].team_a} vs ${finalMatch[0].team_b}`,
      );
    }

    // 9. Atualizar Terceiro Lugar (perdedores) - CORREÇÃO AQUI!
    console.log("\n🏆 Atualizando Terceiro Lugar...");

    const thirdId = db
      .prepare(`SELECT id FROM matches WHERE phase = 'third' LIMIT 1`)
      .get() as { id: number };

    if (thirdId) {
      if (semiLosers.length >= 2) {
        // Se temos os dois perdedores
        db.prepare(
          `UPDATE matches SET team_a = ?, team_b = ? WHERE id = ?`,
        ).run(semiLosers[0], semiLosers[1], thirdId.id);
        console.log(
          `   ✅ Terceiro Lugar: ${semiLosers[0]} vs ${semiLosers[1]}`,
        );
      } else {
        // Se não temos resultados das semis, buscar os times atuais
        const currentThird = db
          .prepare(
            `SELECT team_a, team_b FROM matches WHERE phase = 'third' LIMIT 1`,
          )
          .get() as any;
        console.log(
          `   ⚠️ Terceiro Lugar mantido: ${currentThird?.team_a} vs ${currentThird?.team_b}`,
        );
      }
    }

    // 10. Verificar resultado final
    console.log("\n📊 VERIFICAÇÃO FINAL:");

    const finalTeams = db
      .prepare(
        `SELECT team_a, team_b FROM matches WHERE phase = 'final' LIMIT 1`,
      )
      .get() as any;
    const thirdTeams = db
      .prepare(
        `SELECT team_a, team_b FROM matches WHERE phase = 'third' LIMIT 1`,
      )
      .get() as any;

    console.log(`   Final: ${finalTeams?.team_a} vs ${finalTeams?.team_b}`);
    console.log(`   3º Lugar: ${thirdTeams?.team_a} vs ${thirdTeams?.team_b}`);

    console.log("\n✅ Mata-mata atualizado com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Mata-mata atualizado com sucesso!",
      data: {
        final: `${finalTeams?.team_a} vs ${finalTeams?.team_b}`,
        third: `${thirdTeams?.team_a} vs ${thirdTeams?.team_b}`,
      },
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
