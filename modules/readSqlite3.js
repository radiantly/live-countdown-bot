import Database from "better-sqlite3";
export const db = new Database("db/app.db", {
  readonly: true,
  fileMustExist: true,
});

export const [version] = db.prepare("SELECT sqlite_version()").raw().get();

// Stmt = SQL Query Statement

// Get prefix for a guild
const selectPrefixStmt = db.prepare("SELECT Prefix from GuildInfo WHERE Guild = @guildId");
export const getPrefixFromDb = guildId => selectPrefixStmt.get({ guildId });
// --x--

// Get next message to be updated from the queue
const selectNextInQueueStmt = db.prepare(`
  SELECT Channel, ReplyMessage, NextUpdate, CountObj
  FROM CountdownInfo
  INNER JOIN GuildInfo USING (Guild)
  WHERE Client = ?
  ORDER BY NextUpdate, Priority
  LIMIT 1
`);
export const getNextInQueue = clientId => selectNextInQueueStmt.get(clientId);
// --x--

// Get total number of countdowns
const selectAllCountdownsStmt = db.prepare("SELECT COUNT(*) FROM CountdownInfo;");
export const getTotalCountdowns = () => selectAllCountdownsStmt.raw().get()[0];
// --x--

// Below statements are currently unused

// const selectCountdownsInGuildStmt = db.prepare(
//   "SELECT COUNT(*) FROM CountdownInfo WHERE Guild = ?"
// );
// export const getCountdownsInServer = server => selectCountdownsInGuildStmt.get(server);

// Close DB connection
export const closeDb = () => db.close();
// --x--
