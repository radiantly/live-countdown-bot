import { Client, GatewayIntentBits } from "discord.js";
import Cluster from "discord-hybrid-sharding";
import { MILLISECONDS, MINUTES } from "./modules/utils.js";

import { config } from "./config.js";
import { patchClusterData, removeGuild, setGuildRunId, setGuildsRunId } from "./modules/sqlite3.js";
import { interactionCreateHandler } from "./modules/commands.js";
import { performUpdates } from "./modules/updates.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
});

client.cluster = new Cluster.Client(client);

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
      patchClusterData(client.cluster.id, client.runId, clusterStats());
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
  console.info(`${client.user.tag} (${client.cluster.id}:${client.runId}) ready for business!`);
  setInterval(() => patchClusterData(client.cluster.id, client.runId, clusterStats()), 5 * MINUTES);
  setInterval(performUpdates, 100 * MILLISECONDS, client);
});

client.on("guildCreate", guild => {
  setGuildRunId(guild.id, client.runId);
  console.info(`Added to ${guild.name} (${guild.id})`);
  guild?.systemChannel
    .send("**Glad to be a part of your server** :heart:\nYou're probably looking for `/help`")
    .catch(() => {});
});

client.on("guildDelete", guild => {
  removeGuild(guild.id);
  console.info(`Removed from ${guild.name || "guild"} (${guild.id})`);
});

client.on("interactionCreate", interactionCreateHandler);

client.login(config.token);
