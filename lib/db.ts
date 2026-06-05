import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Criar tabelas
db.exec(`
  -- Tabela de usuários (apostadores)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de jogos
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase TEXT NOT NULL, -- groups, round16, quarter, semi, third, final
    group_name TEXT, -- A, B, C, D, E, F, G, H (para fase de grupos)
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    match_date DATETIME,
    venue TEXT,
    official_score_a INTEGER,
    official_score_b INTEGER,
    is_penalty_shootout BOOLEAN DEFAULT 0,
    winner_on_penalties TEXT,
    is_finished BOOLEAN DEFAULT 0
  );

  -- Tabela de apostas
  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    bet_score_a INTEGER NOT NULL,
    bet_score_b INTEGER NOT NULL,
    bet_penalty_winner TEXT,
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
`);

// Criar índices para melhorar performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_matches_phase ON matches(phase);
  CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
  CREATE INDEX IF NOT EXISTS idx_bets_user_match ON bets(user_id, match_id);
`);

export default db;
