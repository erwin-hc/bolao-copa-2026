import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Criar todas as tabelas
db.exec(`
  -- Tabela de usuários
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de jogos
  CREATE TABLE IF NOT EXISTS matches (
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

  -- Tabela de apostas
  CREATE TABLE IF NOT EXISTS bets (
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

  -- Tabela de ranking
  CREATE TABLE IF NOT EXISTS ranking (
    user_id INTEGER PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    correct_exact INTEGER DEFAULT 0,
    correct_result INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Tabela de configurações
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Índices para performance
  CREATE INDEX IF NOT EXISTS idx_matches_phase ON matches(phase);
  CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
  CREATE INDEX IF NOT EXISTS idx_bets_user_match ON bets(user_id, match_id);
`);

// Verificar se o usuário admin existe
const adminExists = db
  .prepare("SELECT id FROM users WHERE email = ?")
  .get("erwin.stein@gmail.com");

if (!adminExists) {
  console.log("👤 Criando usuário administrador...");

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("erwin", salt);

  // Inserir usuário admin
  const result = db
    .prepare(
      `
    INSERT INTO users (name, email, password, is_admin) 
    VALUES (?, ?, ?, 1)
  `,
    )
    .run("Erwin Guilherme Stein", "erwin.stein@gmail.com", hashedPassword);

  // Inicializar ranking para o admin
  db.prepare("INSERT INTO ranking (user_id, total_points) VALUES (?, 0)").run(
    result.lastInsertRowid,
  );

  console.log("✅ Usuário admin criado: erwin.stein@gmail.com / erwin");
}

// Inserir configuração padrão se não existir
const settingsExist = db
  .prepare("SELECT key FROM settings WHERE key = 'participation_fee'")
  .get();
if (!settingsExist) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('participation_fee', '50')",
  ).run();
  console.log("⚙️ Configuração padrão criada: participation_fee = 50");
}

console.log("✅ Banco de dados inicializado com sucesso!");

export default db;
