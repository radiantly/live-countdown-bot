import { ShardingManager } from "discord.js";
import { config } from "./config.js";

const manager = new ShardingManager("./bot.js", {
  token: config.token,
  execArgv: ["--experimental-loader=./modules/loader.js"],
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
