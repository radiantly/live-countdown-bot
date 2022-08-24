import { Client, GatewayIntentBits } from "discord.js";
import Cluster from "discord-hybrid-sharding";

import { config } from "./config.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
});

client.cluster = new Cluster.Client(client);

client.once("ready", () => {
  console.log(`${client.user.tag} ready for business!`);
});

client.login(config.token);
