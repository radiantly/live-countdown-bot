import Database from "better-sqlite3";
export const db = new Database(process.env.NODE_ENV === "test" ? ":memory:" : "app.db");

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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
  );
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS NextUpdateIndex ON CountdownInfo (
    NextUpdate, Priority
  )
`
).run();

db.prepare("VACUUM").run();

// Stmt = SQL Query Statement

const upsertGuildShardStmt = db.prepare(`
  INSERT INTO GuildInfo (Guild, Client) VALUES (@guildId, @clientId)
    ON CONFLICT(Guild) DO UPDATE SET Client = excluded.Client;
`);

export const initGuilds = db.transaction((guildCache, clientId) => {
  guildCache.each(guild => upsertGuildShardStmt.run({ guildId: guild.id, clientId }));
});
export const addGuild = (guildId, clientId) => upsertGuildShardStmt.run({ guildId, clientId });

const selectPrefixStmt = db.prepare("SELECT Prefix from GuildInfo WHERE Guild = ?");
export const getPrefixFromDb = guildId => selectPrefixStmt.get(guildId);

const updatePrefixStmt = db.prepare("UPDATE GuildInfo SET Prefix = @prefix WHERE Guild = @guildId");
export const updatePrefixInDb = data => updatePrefixStmt.run(data);

const selectAllCountdownsStmt = db.prepare("SELECT COUNT(*) FROM CountdownInfo;");
export const getTotalCountdowns = () => selectAllCountdownsStmt.get();

const selectCountdownsInGuildStmt = db.prepare(
  "SELECT COUNT(*) FROM CountdownInfo WHERE GUILD = ?"
);
export const getCountdownsInServer = server => selectCountdownsInGuildStmt.run(server);

const insertCountdownStmt = db.prepare(`
  INSERT INTO CountdownInfo (Guild, Channel, OriginalMessage, ReplyMessage, NextUpdate, Priority, CountObj)
  VALUES (@guildId, @channelId, @origMsgId, @replyMsgId, @nextUpdate, @priority, @countObj)
`);
export const addCountdown = data => insertCountdownStmt.run(data);

const updateRecomputedCountdownStmt = db.prepare(`
  UPDATE CountdownInfo
  SET NextUpdate = @nextUpdate,
      Priority = @priority
  WHERE ReplyMessage = @replyMsgId
`);
export const updateRecomputedCountdown = data => updateRecomputedCountdownStmt.run(data);

const deleteOldestRowStmt = db.prepare(`
  DELETE FROM CountdownInfo
  WHERE Guild = ?
  ORDER BY Timestamp
  LIMIT 1
`);
export const removeOldestCountdowninGuild = server => deleteOldestRowStmt.run(server);

const deleteMessageStmt = db.prepare("DELETE FROM CountdownInfo WHERE ReplyMessage = ?");
export const removeMessageWithReplyId = messageId => deleteMessageStmt.run(messageId);

const selectNextInQueueStmt = db.prepare(`
  SELECT Channel, ReplyMessage, CountObj
  FROM CountdownInfo
  INNER JOIN GuildInfo USING (Guild)
  WHERE Client = ?
  ORDER BY NextUpdate, Priority
  LIMIT 1
`);
export const getNextInQueue = clientId => selectNextInQueueStmt.get(clientId);
