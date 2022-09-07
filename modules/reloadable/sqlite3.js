import { db } from "../db.js";

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

// covering index
db.prepare(
  `
  CREATE INDEX IF NOT EXISTS guildRunIdIndex ON guilds (
    id, runId
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    data TEXT
  ) STRICT
  `
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS countdowns (
    guild TEXT,
    channel TEXT,
    author TEXT,
    updateTime INTEGER,
    priority INTEGER,
    data TEXT,
    FOREIGN KEY (guild)
      REFERENCES guilds (id)
        ON DELETE CASCADE
  ) STRICT
  `
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS nextCountdownIndex ON countdowns (
    updateTime, priority
  )
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

/// Users table
const insertUserDataStmt = db.prepare(`
  INSERT INTO users (id, data) VALUES (@userId, json(@data))
  ON CONFLICT(id) DO UPDATE SET
    data = json_patch(users.data, excluded.data);
`);
export const setUserData = (userId, dataObj) =>
  insertUserDataStmt.run({ userId, data: JSON.stringify(dataObj) });
const getUserDataStmt = db.prepare("SELECT data FROM users WHERE id = @userId").pluck();
export const getUserData = userId => {
  const result = getUserDataStmt.get({ userId });
  return result ? JSON.parse(result) : {};
};

/// Countdowns table
const insertCountdownStmt = db.prepare(`
  INSERT INTO countdowns (guild, channel, author, updateTime, priority, data)
  VALUES (@guildId, @channelId, @authorId, @updateTime, @priority, json(@data))
`);
export const insertCountdown = (guildId, channelId, authorId, updateTime, data, priority = 42) =>
  insertCountdownStmt.run({
    guildId,
    channelId,
    authorId,
    updateTime,
    priority,
    data: JSON.stringify(data),
  });

const selectNextCountdownStmt = db.prepare(`
  DELETE FROM countdowns
  WHERE updateTime < unixepoch() * 1000
  AND rowid IN (
    SELECT countdowns.rowid FROM countdowns 
    JOIN guilds ON countdowns.guild = guilds.id
    WHERE runId = @runId
    ORDER BY updatetime, priority
    LIMIT 1
  )
  RETURNING *
`);
export const getNextCountDown = runId => selectNextCountdownStmt.get({ runId });

const getGuildCountdownsStmt = db.prepare(`
  SELECT rowid, * FROM countdowns
  WHERE guild = @guildId
`);
export const getGuildCountdowns = ({ guildId }) =>
  getGuildCountdownsStmt.all({ guildId }).map(row => {
    row.data = row.data ? JSON.parse(row.data) : {};
    return row;
  });

const getCountdownStmt = db.prepare(`
  SELECT * FROM countdowns
  WHERE rowid = @rowid
`);
export const getCountdown = rowid => getCountdownStmt.get({ rowid });

const deleteCountdownStmt = db.prepare(`
DELETE FROM countdowns
WHERE rowid = @rowid
`);
export const deleteCountdown = rowid => deleteCountdownStmt.run({ rowid });
