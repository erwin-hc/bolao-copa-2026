const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "../database.sqlite");

console.log("🗑️  RESET COMPLETO DO BANCO DE DADOS");
console.log("=".repeat(60));

// ============================================
// 1. DELETAR O BANCO ANTIGO COMPLETAMENTE
// ============================================
console.log("\n📁 Removendo banco de dados antigo...");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("✅ Banco de dados antigo removido");
} else {
  console.log("ℹ️ Nenhum banco de dados existente encontrado");
}

// ============================================
// 2. CRIAR NOVO BANCO DE DADOS
// ============================================
console.log("\n📁 Criando novo banco de dados...");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase TEXT NOT NULL,
    group_name TEXT,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    match_date DATETIME,
    official_score_a INTEGER,
    official_score_b INTEGER,
    is_finished BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    bet_score_a INTEGER NOT NULL,
    bet_score_b INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (match_id) REFERENCES matches(id),
    UNIQUE(user_id, match_id)
  );

  CREATE TABLE ranking (
    user_id INTEGER PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    correct_exact INTEGER DEFAULT 0,
    correct_result INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX idx_matches_phase ON matches(phase);
  CREATE INDEX idx_matches_date ON matches(match_date);
  CREATE INDEX idx_bets_user_match ON bets(user_id, match_id);
`);

console.log("✅ Tabelas criadas com sucesso");

// ============================================
// 3. CRIAR USUÁRIOS
// ============================================
console.log("\n👥 Criando usuários...");

const salt = bcrypt.genSaltSync(10);

const adminHash = bcrypt.hashSync("erwin", salt);
db.prepare(
  `
  INSERT INTO users (name, email, password, is_admin) 
  VALUES (?, ?, ?, 1)
`,
).run("Erwin Guilherme Stein", "erwin.stein@gmail.com", adminHash);
console.log("   ✅ Admin: erwin.stein@gmail.com / erwin");

const testHash = bcrypt.hashSync("teste", salt);
db.prepare(
  `
  INSERT INTO users (name, email, password, is_admin) 
  VALUES (?, ?, ?, 0)
`,
).run("Usuário Teste", "teste@teste.com", testHash);
console.log("   ✅ Teste: teste@teste.com / teste");

db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (1, 0)").run();
db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (2, 0)").run();
console.log("✅ Ranking inicializado");

// ============================================
// 4. CARREGAR TIMES DA COPA 2026
// ============================================
console.log("\n⚽ CARREGANDO TIMES DA COPA 2026");
console.log("=".repeat(60));

const groups = {
  A: ["Catar", "Equador", "Senegal", "Holanda"],
  B: ["Inglaterra", "Irã", "EUA", "País de Gales"],
  C: ["Argentina", "Arábia Saudita", "México", "Polônia"],
  D: ["França", "Austrália", "Dinamarca", "Tunísia"],
  E: ["Espanha", "Costa Rica", "Alemanha", "Japão"],
  F: ["Bélgica", "Canadá", "Marrocos", "Croácia"],
  G: ["Brasil", "Sérvia", "Suíça", "Camarões"],
  H: ["Portugal", "Gana", "Uruguai", "Coreia do Sul"],
};
// DATAS ORGANIZADAS POR RODADA (TODOS OS GRUPOS JOGAM NOS MESMOS DIAS)
const groupStageDates = {
  rodada1: { data: "2026-06-08", horarios: ["13:00:00", "16:00:00"] },
  rodada2: { data: "2026-06-09", horarios: ["13:00:00", "16:00:00"] },
  rodada3: { data: "2026-06-13", horarios: ["13:00:00", "16:00:00"] },
  rodada4: { data: "2026-06-14", horarios: ["13:00:00", "16:00:00"] },
  rodada5: { data: "2026-06-18", horarios: ["13:00:00", "16:00:00"] },
  rodada6: { data: "2026-06-19", horarios: ["13:00:00", "16:00:00"] },
};

const groupOrder = ["A", "B", "C", "D", "E", "F", "G", "H"];
const matches = [];

// Fase de Grupos - 48 jogos (6 rodadas x 8 grupos = 48)
let rodadaIndex = 1;
for (const [rodada, rodadaInfo] of Object.entries(groupStageDates)) {
  for (const group of groupOrder) {
    const teams = groups[group];

    // Determinar qual jogo do grupo nesta rodada
    let teamA, teamB;
    switch (rodadaIndex) {
      case 1:
        teamA = teams[0];
        teamB = teams[1];
        break;
      case 2:
        teamA = teams[2];
        teamB = teams[3];
        break;
      case 3:
        teamA = teams[0];
        teamB = teams[2];
        break;
      case 4:
        teamA = teams[1];
        teamB = teams[3];
        break;
      case 5:
        teamA = teams[0];
        teamB = teams[3];
        break;
      case 6:
        teamA = teams[1];
        teamB = teams[2];
        break;
      default:
        continue;
    }

    // Alternar horários entre os grupos
    const horario =
      groupOrder.indexOf(group) % 2 === 0
        ? rodadaInfo.horarios[0]
        : rodadaInfo.horarios[1];
    const matchDate = `${rodadaInfo.data} ${horario}`;

    matches.push({
      phase: "groups",
      group_name: group,
      team_a: teamA,
      team_b: teamB,
      match_date: matchDate,
    });
  }
  rodadaIndex++;
}

console.log(`   ✅ 48 jogos da fase de grupos criados`);

// ============================================
// MATA-MATA COM DATAS CORRETAS
// ============================================
console.log("\n🏆 Inserindo mata-mata...");

// Oitavas de Final - 8 jogos
const round16Dates = [
  "2026-06-28 13:00:00",
  "2026-06-28 16:00:00",
  "2026-06-29 13:00:00",
  "2026-06-29 16:00:00",
  "2026-06-30 13:00:00",
  "2026-06-30 16:00:00",
  "2026-07-01 13:00:00",
  "2026-07-01 16:00:00",
];

const round16Matches = [
  { team_a: "1A", team_b: "2B" },
  { team_a: "1C", team_b: "2D" },
  { team_a: "1E", team_b: "2F" },
  { team_a: "1G", team_b: "2H" },
  { team_a: "1B", team_b: "2A" },
  { team_a: "1D", team_b: "2C" },
  { team_a: "1F", team_b: "2E" },
  { team_a: "1H", team_b: "2G" },
];

for (let i = 0; i < round16Matches.length; i++) {
  matches.push({
    phase: "round16",
    group_name: null,
    team_a: round16Matches[i].team_a,
    team_b: round16Matches[i].team_b,
    match_date: round16Dates[i],
  });
}
console.log("   ✅ Oitavas de final (8 jogos)");

// Quartas de Final - 4 jogos
const quarterDates = [
  "2026-07-02 13:00:00",
  "2026-07-02 16:00:00",
  "2026-07-03 13:00:00",
  "2026-07-03 16:00:00",
];

for (let i = 0; i < 4; i++) {
  matches.push({
    phase: "quarter",
    group_name: null,
    team_a: `QF${i * 2 + 1}`,
    team_b: `QF${i * 2 + 2}`,
    match_date: quarterDates[i],
  });
}
console.log("   ✅ Quartas de final (4 jogos)");

// Semifinais - 2 jogos
matches.push({
  phase: "semi",
  group_name: null,
  team_a: "SF1",
  team_b: "SF2",
  match_date: "2026-07-06 13:00:00",
});
matches.push({
  phase: "semi",
  group_name: null,
  team_a: "SF3",
  team_b: "SF4",
  match_date: "2026-07-07 13:00:00",
});
console.log("   ✅ Semifinais (2 jogos)");

// Terceiro lugar
matches.push({
  phase: "third",
  group_name: null,
  team_a: "LSF1",
  team_b: "LSF2",
  match_date: "2026-07-10 13:00:00",
});
console.log("   ✅ Disputa de 3º lugar (1 jogo)");

// Final
matches.push({
  phase: "final",
  group_name: null,
  team_a: "WSF1",
  team_b: "WSF2",
  match_date: "2026-07-11 15:00:00",
});
console.log("   ✅ Final (1 jogo)");

// ============================================
// 5. INSERIR JOGOS
// ============================================
console.log(`\n📊 Inserindo ${matches.length} jogos no banco...`);

const insertMatch = db.prepare(`
  INSERT INTO matches (phase, group_name, team_a, team_b, match_date, is_finished)
  VALUES (?, ?, ?, ?, ?, 0)
`);

for (const match of matches) {
  insertMatch.run(
    match.phase,
    match.group_name,
    match.team_a,
    match.team_b,
    match.match_date,
  );
}

console.log(`✅ ${matches.length} jogos inseridos com sucesso!`);

// ============================================
// 6. VERIFICAR DATAS POR GRUPO
// ============================================
console.log("\n📅 VERIFICANDO DATAS POR GRUPO:");

for (const group of groupOrder) {
  const groupMatches = db
    .prepare(
      `
    SELECT team_a, team_b, match_date 
    FROM matches 
    WHERE phase = 'groups' AND group_name = ?
    ORDER BY match_date
  `,
    )
    .all(group);

  console.log(`\n📍 Grupo ${group}:`);
  groupMatches.forEach((m) => {
    const matchDate = new Date(m.match_date);
    const isPast = matchDate < new Date();
    console.log(
      `   ${m.team_a} vs ${m.team_b}: ${m.match_date} ${isPast ? "🔴" : "🟢"}`,
    );
  });
}

// ============================================
// 7. RESUMO DOS GRUPOS
// ============================================
console.log("\n📋 GRUPOS DA COPA 2026:");
console.log("=".repeat(60));
for (const [group, teams] of Object.entries(groups)) {
  console.log(`\n📍 Grupo ${group}:`);
  console.log(`   ${teams[0]} | ${teams[1]} | ${teams[2]} | ${teams[3]}`);
}

// ============================================
// 8. VERIFICAÇÃO FINAL
// ============================================
console.log("\n📊 VERIFICAÇÃO FINAL:");
const matchCount = db.prepare("SELECT COUNT(*) as total FROM matches").get();
const groupCount = db
  .prepare("SELECT COUNT(*) as total FROM matches WHERE phase = 'groups'")
  .get();
const knockoutCount = db
  .prepare("SELECT COUNT(*) as total FROM matches WHERE phase != 'groups'")
  .get();
const userCount = db.prepare("SELECT COUNT(*) as total FROM users").get();

console.log(`   👥 Usuários: ${userCount.total}`);
console.log(`   🏟️  Total de jogos: ${matchCount.total}`);
console.log(`   📋 Fase de Grupos: ${groupCount.total} jogos`);
console.log(`   🏆 Mata-mata: ${knockoutCount.total} jogos`);

console.log("\n✅ BANCO RESETADO COM SUCESSO!");
console.log("=".repeat(60));
console.log("\n🔑 CREDENCIAIS:");
console.log("   Admin: erwin.stein@gmail.com / erwin");
console.log("   Teste: teste@teste.com / teste");
console.log("\n📅 TODAS AS DATAS ESTÃO EM JUNHO/JULHO 2026 (FUTURO)");
console.log("🚀 As apostas estarão LIBERADAS para todos os jogos!");
