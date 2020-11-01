import { ShardingManager } from "discord.js";
import config from "./config.js";
import { postServerCount } from "./modules/post.js";
import { vacuumDb, closeDb } from "./modules/sqlite3.js";

const { token } = config;

// Vacuum database
vacuumDb();
closeDb();
// --x--

const manager = new ShardingManager("./modules/bot.js", { token });

manager.spawn();

manager.on("shardCreate", shard => console.log(`Launched client (${shard.id}).`));

// Post server counts to bot lists hourly.
setInterval(async () => {
  manager.fetchClientValues("guilds.cache.size").then(postServerCount);
}, 60 * 60 * 1000);
