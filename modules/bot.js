import Cluster from "discord-hybrid-sharding";
import { Client, Intents, Options, Permissions } from "discord.js";
import process, { env } from "process";
import config from "../config.js";
import {
  initGuilds,
  addGuild,
  removeGuild,
  closeDb,
  updateClusterInfo,
  removeMessageWithReplyId,
} from "./sqlite3.js";
import { messageHandler } from "./messageHandler.js";
import { updateCountdowns } from "./updateManager.js";
import { interactionHandler } from "./interactionHandler.js";

const client = new Client({
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
  presence: {
    status: "online",
    activities: [
      // { type: "WATCHING", name: "maintenance" },
      { type: "PLAYING", name: "with time" },
      { type: "PLAYING", name: "with 100 seconds" },
      { type: "WATCHING", name: "for !help" },
      { type: "WATCHING", name: "times change" },
      { type: "WATCHING", name: "the time fly by" },
      { type: "LISTENING", name: "the clock tick" },
      { type: "COMPETING", name: "the race for time" },
    ],
  },
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    PresenceManager: 0,
    ThreadManager: 0,
  }),
  partials: ["MESSAGE", "CHANNEL"],
  intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.cluster = new Cluster.Client(client);

export const clientId = Math.round(Math.random() * 1e9);

const log = console.log;

client.once("ready", () => {
  log(`Initialized cluster ${client.cluster.id} (${clientId}).`);
  setInterval(
    () => updateClusterInfo(client.cluster.id, client.guilds.cache.size, process.memoryUsage().rss),
    5 * 60 * 1000
  );

  initGuilds(client.guilds.cache, clientId);
  updateCountdowns(client, clientId);
});

client.on("messageCreate", messageHandler);
client.on("messageDelete", message => {
  removeMessageWithReplyId(message.id);
});
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
client.login(config.token);
if (env.NODE_ENV === "debug") client.on("debug", console.info);

process.on("unhandledRejection", log);
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
process.on("exit", code => {
  console.log(`Destroying cluster ${client.cluster.id} (${clientId}). Code ${code}.`);
  client.destroy();
  closeDb();
});
