import Database from "better-sqlite3";
export const db = new Database("db/app.db");

import config from "../config.js";

const { channelMax } = config;

// Initialize database
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
// --x--

// Stmt = SQL Query Statement

// Vacuum database
const vacuumStmt = db.prepare("VACUUM");
export const vacuumDb = () => vacuumStmt.run();
// --x--

// Add guilds to GuildInfo table
const upsertGuildShardStmt = db.prepare(`
  INSERT INTO GuildInfo (Guild, Client) VALUES (@guildId, @clientId)
    ON CONFLICT(Guild) DO UPDATE SET Client = excluded.Client;
`);

export const initGuilds = db.transaction((guildIdArray, clientId) => {
  guildIdArray.forEach(guildId => upsertGuildShardStmt.run({ guildId, clientId }));
});
export const addGuild = (guildId, clientId) => upsertGuildShardStmt.run({ guildId, clientId });
// --x--

// Remove guild
const deleteGuildStmt = db.prepare("DELETE FROM GuildInfo WHERE Guild = @guildId");
export const removeGuild = guildId => deleteGuildStmt.run({ guildId });
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

// Set prefix for a guild
const updatePrefixStmt = db.prepare("UPDATE GuildInfo SET Prefix = @prefix WHERE Guild = @guildId");
export const updatePrefixInDb = data => updatePrefixStmt.run(data);
// --x--

// Removing countdowns
const deleteMessageStmt = db.prepare("DELETE FROM CountdownInfo WHERE ReplyMessage = ?");
export const removeMessageWithReplyId = messageId => deleteMessageStmt.run(messageId);
// --x--

// Save the recomputed cowntdown once it is processes
const updateRecomputedCountdownStmt = db.prepare(`
  UPDATE CountdownInfo
  SET NextUpdate = @nextUpdate,
      Priority = @priority
  WHERE ReplyMessage = @replyMsgId
`);
export const updateRecomputedCountdown = data => updateRecomputedCountdownStmt.run(data);
// --x--

// Close DB connection
export const closeDb = () => db.close();
// --x--
