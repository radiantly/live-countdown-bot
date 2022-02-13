import Database from "better-sqlite3";
export const db = new Database(process.env.NODE_ENV === "test" ? ":memory:" : "db/app.db");

import config from "../config.js";

const { channelMax } = config;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export const [version] = db.prepare("SELECT sqlite_version()").raw().get();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS ClusterInfo (
    Id INTEGER PRIMARY KEY NOT NULL,
    GuildCount INTEGER NOT NULL,
    RAM INTEGER NOT NULL
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS GuildInfo (
    Guild TEXT PRIMARY KEY NOT NULL,
    Client INTEGER NOT NULL,
    Prefix TEXT DEFAULT "!" NOT NULL
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS CountdownInfo (
    Guild TEXT NOT NULL,
    Channel TEXT NOT NULL,
    OriginalMessage TEXT UNIQUE NOT NULL,
    ReplyMessage TEXT PRIMARY KEY NOT NULL,
    NextUpdate TEXT NOT NULL,
    Priority INTEGER NOT NULL,
    CountObj TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Guild)
      REFERENCES GuildInfo (Guild)
        ON DELETE CASCADE
  )
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS GuildChannelIndex ON CountdownInfo (
    Guild, Channel
  )
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS NextUpdateIndex ON CountdownInfo (
    NextUpdate, Priority
  )
`
).run();

// Stmt = SQL Query Statement

const vacuumStmt = db.prepare("VACUUM");

export const vacuumDb = () => vacuumStmt.run();
export const closeDb = () => db.close();

// Add cluster info
const upsertClusterInfoStmt = db.prepare(`
  INSERT INTO ClusterInfo (Id, GuildCount, RAM) VALUES (@clusterId, @guildCount, @ramUsage)
    ON CONFLICT(Id) DO UPDATE SET
      GuildCount = excluded.GuildCount,
      RAM = excluded.RAM
`);

export const updateClusterInfo = (clusterId, guildCount, ramUsage) =>
  upsertClusterInfoStmt.run({ clusterId, guildCount, ramUsage });

// Get total cluster statistics
const totalClusterInfoStmt = db.prepare("SELECT TOTAL(GuildCount), TOTAL(RAM) FROM ClusterInfo");
export const getClusterStats = () => totalClusterInfoStmt.get();

// Add guilds to GuildInfo table
const upsertGuildShardStmt = db.prepare(`
  INSERT INTO GuildInfo (Guild, Client) VALUES (@guildId, @clientId)
    ON CONFLICT(Guild) DO UPDATE SET Client = excluded.Client;
`);

export const initGuilds = db.transaction((guildCache, clientId) => {
  guildCache.each(guild => upsertGuildShardStmt.run({ guildId: guild.id, clientId }));
});
export const addGuild = (guildId, clientId) => upsertGuildShardStmt.run({ guildId, clientId });
// --x--

// Remove guild
const deleteGuildStmt = db.prepare("DELETE FROM GuildInfo WHERE Guild = @guildId");
export const removeGuild = guildId => deleteGuildStmt.run({ guildId });
// --x--

// Get or set prefix for each guild
const selectPrefixStmt = db.prepare("SELECT Prefix from GuildInfo WHERE Guild = @guildId");
export const getPrefixFromDb = guildId => selectPrefixStmt.get({ guildId });

const updatePrefixStmt = db.prepare("UPDATE GuildInfo SET Prefix = @prefix WHERE Guild = @guildId");
export const updatePrefixInDb = data => updatePrefixStmt.run(data);
// --x--

// Adding countdown section
const trimCountdownsInChannelStmt = db.prepare(`
  DELETE FROM CountdownInfo
  WHERE Guild = @guildId AND Channel = @channelId
  ORDER BY Timestamp DESC
  LIMIT 10 OFFSET @channelMax
`);
const insertCountdownStmt = db.prepare(`
  INSERT INTO CountdownInfo (Guild, Channel, OriginalMessage, ReplyMessage, NextUpdate, Priority, CountObj)
  VALUES (@guildId, @channelId, @origMsgId, @replyMsgId, @nextUpdate, @priority, @countObj)
`);
export const addCountdown = data => {
  insertCountdownStmt.run(data);
  const { guildId, channelId } = data;
  trimCountdownsInChannelStmt.run({ guildId, channelId, channelMax });
};
// --x--

// Removing countdowns
const deleteMessageStmt = db.prepare("DELETE FROM CountdownInfo WHERE ReplyMessage = ?");
export const removeMessageWithReplyId = messageId => deleteMessageStmt.run(messageId);
// --x--

const updateCountObjStmt = db.prepare(`
  UPDATE CountdownInfo
  SET CountObj = @countObj
  WHERE ReplyMessage = @replyMsgId
`);
export const updateCountObj = data => updateCountObjStmt.run(data);

const updateRecomputedCountdownStmt = db.prepare(`
  UPDATE CountdownInfo
  SET NextUpdate = @nextUpdate,
      Priority = @priority
  WHERE ReplyMessage = @replyMsgId
`);
export const updateRecomputedCountdown = data => updateRecomputedCountdownStmt.run(data);

const selectNextInQueueStmt = db.prepare(`
  SELECT Channel, ReplyMessage, NextUpdate, CountObj
  FROM CountdownInfo
  INNER JOIN GuildInfo USING (Guild)
  WHERE Client = ?
  ORDER BY NextUpdate, Priority
  LIMIT 1
`);
export const getNextInQueue = clientId => selectNextInQueueStmt.get(clientId);

// Get total number of countdowns
const selectAllCountdownsStmt = db.prepare("SELECT COUNT(*) FROM CountdownInfo;");
export const getTotalCountdowns = () => selectAllCountdownsStmt.raw().get()[0];
// --x--

// Below statements are currently unused

const selectCountdownsInGuildStmt = db.prepare(
  "SELECT COUNT(*) FROM CountdownInfo WHERE Guild = ?"
);
export const getCountdownsInServer = server => selectCountdownsInGuildStmt.get(server);

const deleteOldestRowStmt = db.prepare(`
  DELETE FROM CountdownInfo
  WHERE Guild = ?
  ORDER BY Timestamp
  LIMIT 1
`);
export const removeOldestCountdowninGuild = server => deleteOldestRowStmt.run(server);
