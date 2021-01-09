import { ShardingManager } from "discord.js";
import config from "./config.js";
import { vacuumDb, closeDb } from "./modules/sqlite3.js";
import setTz from "set-tz";

setTz("Asia/Riyadh");

const { token } = config;

// Vacuum database
vacuumDb();
closeDb();
// --x--

const manager = new ShardingManager("./modules/bot.js", { token });

manager.spawn();

manager.on("shardCreate", shard => console.log(`Launched client (${shard.id}).`));
