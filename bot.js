import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";

// The items imported below are NON RELOADABLE
import { MILLISECONDS, MINUTES } from "./modules/reloadable/utils.js";
import {
  kv,
  patchClusterData,
  removeGuild,
  setGuildRunId,
  setGuildsRunId,
} from "./modules/reloadable/sqlite3.js";

const client = new Client({
  presence: {
    status: "online",
    activities: [
      { type: ActivityType.Playing, name: "with time" },
      { type: ActivityType.Playing, name: "with 100 seconds" },
      { type: ActivityType.Watching, name: "times change" },
      { type: ActivityType.Watching, name: "for /countdown" },
      { type: ActivityType.Watching, name: "the time fly by" },
      { type: ActivityType.Watching, name: "the migration to slash commands" },
      { type: ActivityType.Listening, name: "the clock tick" },
      { type: ActivityType.Competing, name: "the race for time" },
    ],
  },
  intents: [GatewayIntentBits.Guilds],
});

// Only items from the reloadables module are reloadable
let loadId = 0;
let reloadables;
const loadReloadables = async () =>
  (reloadables = await import(`./modules/reloadable/index.js?loadId=${++loadId}`));

await loadReloadables();
client.reloadReloadables = loadReloadables;

const clusterStats = () => ({
  rss: process.memoryUsage().rss,
  guildCount: client.guilds.cache.size,
});

// Initialize cluster with random runId
const initializeCluster = () => {
  while (true) {
    client.runId = Math.floor(Math.random() * 1000000009);

    // if runId already exists, then SQLite will throw a unique constraint error
    // in that case, we regenerate a new one
    try {
      patchClusterData(client.shard.ids[0], client.runId, {
        readyAt: Date.now(),
        guildCount: client.guilds.cache.size,
      });
      break;
    } catch (ex) {
      console.log("regenerating runId", ex);
    }
  }
};

client.once("ready", () => {
  console.assert(config.botId === client.user.id);

  initializeCluster();
  setGuildsRunId(client.guilds.cache, client.runId);
  console.info(`${client.user.tag} (${client.shard.ids}:${client.runId}) ready for business!`);
  setInterval(
    () => patchClusterData(client.shard.ids[0], client.runId, clusterStats()),
    5 * MINUTES
  );
  setInterval(() => reloadables.performUpdates(client), 100 * MILLISECONDS);
});

client.on("guildCreate", guild => {
  setGuildRunId(guild.id, client.runId);
  console.info(`Added to ${guild.name} (${guild.id})`);
  guild?.systemChannel
    ?.send("**Glad to be a part of your server** :heart:\nYou're probably looking for `/help`")
    .catch(() => {});
});

client.on("guildDelete", guild => {
  removeGuild(guild.id);
  console.info(`Removed from ${guild.name || "guild"} (${guild.id})`);
});

client.on("interactionCreate", interaction => {
  client.lastInteraction = Date.now();
  reloadables.interactionCreateHandler(interaction);
});

client.on("warn", console.error);

// TODO: handle errors
process.on("uncaughtException", err => {
  console.error(err);
  kv.uncaughtExceptionCount = (kv.uncaughtExceptionCount ?? 0) + 1;
});
process.on("unhandledRejection", err => {
  console.error(err);
  kv.unhandledRejectionCount = (kv.unhandledRejectionCount ?? 0) + 1;
});

client.login(config.token);
