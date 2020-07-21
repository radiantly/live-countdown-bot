import { ShardingManager } from "discord.js";
import config from "./config.js";
import { postServerCount } from "./modules/post.js";

const { token } = config;

const manager = new ShardingManager("./modules/bot.js", { token });

manager.spawn();

manager.on("shardCreate", shard => console.log(`Launched client (${shard.id}).`));

// Post server counts to bot lists hourly.
if (process.env.NODE_ENV === "production")
  setInterval(() => {
    manager.fetchClientValues("guilds.cache.size").then(postServerCount).catch(console.error);
  }, 60 * 60 * 1000);
