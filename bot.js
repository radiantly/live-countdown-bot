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
import { updateQueue } from "./modules/update_queue.js";

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

const initializeCluster = () => {
  const runId = client.shard.ids[0];
  patchClusterData(client.shard.ids[0], runId, {
    readyAt: Date.now(),
    guildCount: client.guilds.cache.size,
  });

  // update connected guilds to given shardId
  setGuildsRunId(client.guilds.cache, runId);
  updateQueue.load(runId);
};

client.once("ready", () => {
  console.assert(config.botId === client.user.id);

  initializeCluster();
  console.info(`${client.user.tag} (${client.shard.ids}) ready for business!`);
  setInterval(
    () => patchClusterData(client.shard.ids[0], client.shard.ids[0], clusterStats()),
    5 * MINUTES
  );
  setInterval(() => reloadables.performUpdates(client), 100 * MILLISECONDS);
});

client.on("guildCreate", guild => {
  setGuildRunId(guild.id, client.shard.ids[0]);
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
