const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "../database.sqlite");

console.log("🗑️  LIMPEZA COMPLETA DO BANCO DE DADOS");
console.log("=".repeat(60));

// Deletar o banco antigo completamente
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("✅ Banco de dados antigo removido");
} else {
  console.log("ℹ️ Nenhum banco de dados existente encontrado");
}

// Criar novo banco
const db = new Database(dbPath);
console.log("✅ Novo banco de dados criado");

// Criar todas as tabelas
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
`);

console.log("✅ Tabelas criadas");

// Criar usuários
const salt = bcrypt.genSaltSync(10);

// Usuário Admin
const adminHash = bcrypt.hashSync("erwin", salt);
db.prepare(
  `
  INSERT INTO users (name, email, password, is_admin) 
  VALUES (?, ?, ?, 1)
`,
).run("Erwin Guilherme Stein", "erwin.stein@gmail.com", adminHash);
console.log("✅ Admin: erwin.stein@gmail.com / erwin");

// Usuário Teste
const testHash = bcrypt.hashSync("teste", salt);
db.prepare(
  `
  INSERT INTO users (name, email, password, is_admin) 
  VALUES (?, ?, ?, 0)
`,
).run("Usuário Teste", "teste@teste.com", testHash);
console.log("✅ Teste: teste@teste.com / teste");

// Inicializar ranking
db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (1, 0)").run();
db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (2, 0)").run();

console.log("\n✨ BANCO DE DADOS RESETADO COM SUCESSO!");
console.log("🚀 Agora execute o script para carregar os jogos");
