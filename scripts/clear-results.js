const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../database.sqlite");
const db = new Database(dbPath);

console.log("🔧 FORÇANDO LIMPEZA DE RESULTADOS");
console.log("=".repeat(50));

// Desabilitar foreign keys temporariamente
db.exec("PRAGMA foreign_keys = OFF;");

// Limpar apostas primeiro
db.prepare("DELETE FROM bets").run();
console.log("✅ Apostas removidas");

// Limpar ranking
db.prepare("DELETE FROM ranking").run();
console.log("✅ Ranking removido");

// Limpar resultados dos jogos
db.prepare(
  "UPDATE matches SET official_score_a = NULL, official_score_b = NULL, is_finished = 0",
).run();
console.log("✅ Resultados dos jogos removidos");

// Reabilitar foreign keys
db.exec("PRAGMA foreign_keys = ON;");

// Verificar
const remaining = db
  .prepare(
    "SELECT COUNT(*) as count FROM matches WHERE official_score_a IS NOT NULL",
  )
  .get();
console.log(`\n📊 Jogos com resultado restantes: ${remaining.count}`);

// Mostrar times que ainda têm resultado (se houver)
if (remaining.count > 0) {
  const results = db
    .prepare(
      "SELECT team_a, team_b, official_score_a, official_score_b FROM matches WHERE official_score_a IS NOT NULL",
    )
    .all();
  console.log("Times com resultado:", results);
} else {
  console.log("✅ Todos os resultados foram removidos com sucesso!");
}

console.log("\n✨ Limpeza forçada concluída!");
