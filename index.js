import { ShardingManager } from "discord.js";
import config from "./config.js";

const { token } = config;

const manager = new ShardingManager("./modules/bot.js", { token });

manager.spawn();

manager.on("shardCreate", shard => console.log(`Launched shard id: ${shard.id}`));
