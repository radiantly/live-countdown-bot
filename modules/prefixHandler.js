import { getPrefixFromDb, updatePrefixInDb } from "./sqlite3.js";

const prefixes = new WeakMap();

export const getPrefix = guild => {
  const prefix = prefixes.get(guild);
  if (prefix) return prefix;

  const { Prefix } = getPrefixFromDb(guild.id);
  prefixes.set(guild, Prefix);
  return Prefix || "!";
};

export const setPrefix = (guild, prefix = "!") => {
  prefixes.set(guild, prefix);
  updatePrefixInDb({ guildId: guild.id, prefix });
};

// If text contains `, escape all special symbols
// If not, return `text`
export const escapeBacktick = text =>
  text.includes("`") ? text.replace(/([`*_~])/g, "\\$1") : `\`${text}\``;
