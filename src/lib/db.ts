import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "database.sqlite");

let db: Database | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    migrate(db);
    persist(db);
  }
  return db;
}

function persist(database: Database) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = database.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function persistDb() {
  if (db) {
    // Debounce writes to avoid excessive I/O
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => persist(db!), 100);
  }
}

function migrate(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      score INTEGER NOT NULL,
      results_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      form_data_json TEXT NOT NULL,
      content_md TEXT,
      content_html TEXT,
      stripe_session_id TEXT,
      paid INTEGER DEFAULT 0,
      email TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      stripe_session_id TEXT UNIQUE NOT NULL,
      product_type TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      reference_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
