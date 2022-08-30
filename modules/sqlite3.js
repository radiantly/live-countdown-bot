import Database from "better-sqlite3";
import { config } from "../config.js";

const db = new Database(`db/${config.name}.db`);

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

/*
 * The tables below are probably going to be store data as a json object.
 * This makes it much easier to put throw in new data instead of dealing with
 * database schema migrations.
 */
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS clusters (
    id INTEGER PRIMARY KEY NOT NULL,
    runId INTEGER UNIQUE NOT NULL,
    data TEXT NOT NULL
  ) STRICT
  `
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY NOT NULL,
    runId INTEGER NOT NULL,
    data TEXT
  ) STRICT
  `
).run();

/// Key-Value Load & Store
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

/// Cluster Table
const patchClusterDataStmt = db.prepare(
  `
  INSERT INTO clusters (id, runId, data) VALUES (@clusterId, @runId, json(@data))
  ON CONFLICT(id) DO UPDATE SET
    runId = excluded.runId,
    data = json_patch(clusters.data, excluded.data);
  `
);
export const patchClusterData = (clusterId, runId, dataObj) =>
  patchClusterDataStmt.run({ clusterId, runId, data: JSON.stringify(dataObj) });
const getClusterDataSumStmt = db.prepare("SELECT SUM(data->>?) FROM clusters").pluck();
export const getClusterDataSum = key => getClusterDataSumStmt.get(key);

/// Guilds Table
const upsertGuildStmt = db.prepare(`
  INSERT INTO guilds (id, runId) VALUES (@guildId, @runId)
    ON CONFLICT(id) DO UPDATE SET runId = excluded.runId;
`);
export const setGuildRunId = (guildId, runId) => upsertGuildStmt.run({ guildId, runId });

export const setGuildsRunId = db.transaction((guildCollection, runId) => {
  for (const guildId of guildCollection.keys()) {
    upsertGuildStmt.run({ guildId, runId });
  }
});

const removeGuildStmt = db.prepare("DELETE FROM guilds WHERE id = @guildId");
export const removeGuild = guildId => removeGuildStmt.run({ guildId });
