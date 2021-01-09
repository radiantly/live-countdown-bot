import { getChanFromDb, updateChanInDb } from "./sqlite3.js";

const chans = new WeakMap();

export const getChan = guild => {
  const chan = chans.get(guild);
  if (chan) return chan;

  const { Chan } = getChanFromDb(guild.id);
  chans.set(guild, Chan);
  return Chan;
};

export const setChan = (guild, chan) => {
  chans.set(guild, chan);
  updateChanInDb({ guildId: guild.id, chan });
};
