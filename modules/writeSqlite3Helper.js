import { client } from "./bot.js";
const dbFunctions = [
  "initGuilds",
  "addGuild",
  "removeGuild",
  "addCountdown",
  "updatePrefixInDb",
  "removeMessageWithReplyId",
  "updateRecomputedCountdown",
].map(func => {
  return (...args) =>
    client.shard.send({
      module: "writeSqlite3",
      func,
      args,
    });
});

export const [
  initGuilds,
  addGuild,
  removeGuild,
  addCountdown,
  updatePrefixInDb,
  removeMessageWithReplyId,
  updateRecomputedCountdown,
] = dbFunctions;
