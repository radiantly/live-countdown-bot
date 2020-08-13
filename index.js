import { ShardingManager } from "discord.js";
import config from "./config.js";
import { postServerCount } from "./modules/post.js";
import * as writeSqlite3 from "./modules/writeSqlite3.js";

const { token } = config;

// Vacuum database
writeSqlite3.vacuumDb();
// --x--

const manager = new ShardingManager("./modules/bot.js", { token });

const handleShardMessage = message => {
  if (message.module === "writeSqlite3") {
    const { func, args } = message;
    writeSqlite3[func].apply(null, args);
  }
};

manager.spawn().then(shards => shards.each(shard => shard.on("message", handleShardMessage)));

manager.on("shardCreate", shard => console.log(`Launched client (${shard.id}).`));

// Post server counts to bot lists hourly.
if (process.env.NODE_ENV === "production")
  setInterval(() => {
    manager.fetchClientValues("guilds.cache.size").then(postServerCount).catch(console.error);
  }, 60 * 60 * 1000);
