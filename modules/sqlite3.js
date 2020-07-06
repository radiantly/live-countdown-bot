import Database from "better-sqlite3";
export const db = new Database(process.env.NODE_ENV == "test" ? ":memory:" : "app.db");

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS GuildInfo (
    Guild TEXT PRIMARY KEY NOT NULL,
    Shard INTEGER NOT NULL
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

const upsertGuildShard = db.prepare(`
  INSERT INTO GuildInfo (Guild, Shard) VALUES (@guildId, @shardId)
    ON CONFLICT(Guild) DO UPDATE SET Shard = excluded.Shard;
`);

export const initGuilds = db.transaction((guildCache, shardId) => {
  guildCache.each(guild => upsertGuildShard.run({ guildId: guild.id, shardId }));
});

