import { Client, Intents, Options, Permissions } from "discord.js";

import process, { env } from "process";
import config from "../config.js";
import { initGuilds, addGuild, removeGuild, closeDb } from "./sqlite3.js";
import { messageHandler } from "./messageHandler.js";
import { updateCountdowns } from "./updateManager.js";
import { interactionHandler } from "./interactionHandler.js";

const client = new Client({
  presence: {
    status: "online",
    activities: [
      { type: "PLAYING", name: "with time" },
      { type: "PLAYING", name: "with 100 seconds" },
      { type: "WATCHING", name: "for !help" },
      { type: "WATCHING", name: "times change" },
      { type: "WATCHING", name: "the time fly by" },
      { type: "WATCHING", name: "https://bit.ly/live-bot" },
      { type: "LISTENING", name: "the clock tick" },
      { type: "COMPETING", name: "the race for time" },
    ],
  },
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    PresenceManager: 0,
    ThreadManager: 0,
  }),
  partials: ["CHANNEL"],
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

export const clientId = Math.round(Math.random() * 1e9);

const { token } = config;
const log = console.log;

client.once("ready", () => {
  log(`Initialized client ${clientId} (${client.shard.ids.join()}).`);

  initGuilds(client.guilds.cache, clientId);
  updateCountdowns(client, clientId);
});

client.on("messageCreate", messageHandler);
client.on("interactionCreate", interactionHandler);

client.on("guildCreate", guild => {
  addGuild(guild.id, clientId);
  if (guild.systemChannel?.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES))
    guild.systemChannel.send(
      "**Glad to be a part of your server** :heart:\nYou're probably looking for `!help`"
    );
  log(`Added to ${guild.name} (${guild.id})`);
});

client.on("guildDelete", guild => {
  log(`Removed from ${guild.name} (${guild.id})`);
  removeGuild(guild.id);
});

client.on("rateLimit", rateLimitInfo => {
  log(rateLimitInfo);
});

// Start client
client.login(token);
if (env.NODE_ENV === "debug") client.on("debug", console.info);

process.on("unhandledRejection", log);
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
process.on("exit", code => {
  console.log(`Destroying client ${clientId} (${client.shard.ids.join()}). Code ${code}.`);
  client.destroy();
  closeDb();
});
