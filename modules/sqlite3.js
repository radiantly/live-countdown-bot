import Database from "better-sqlite3";

const db = new Database("db/app.db");

// https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

export const version = db.prepare("SELECT sqlite_version()").pluck().get();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY NOT NULL,
    value JSON
  )
  `
).run();

// Key-Value Load & Store
const getValueStmt = db.prepare("SELECT value from kv WHERE key = @key").pluck();
const setValueStmt = db.prepare(
  `
  INSERT INTO kv (key, value) VALUES (@key, @value)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `
);
export const kv = new Proxy(
  {},
  {
    get(_, key) {
      return getValueStmt.get({ key });
    },
    set(_, key, value) {
      return setValueStmt.run({ key, value }).changes === 1;
    },
  }
);
