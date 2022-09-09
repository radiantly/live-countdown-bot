import { Manager } from "discord-hybrid-sharding";
import { config } from "./config.js";
import { postServerCount } from "./modules/post.js";
import { commandList } from "./modules/reloadable/command_list.js";
import { registerCommands } from "./modules/reloadable/register.js";

import { clearClusterData, getClusterDataSum } from "./modules/reloadable/sqlite3.js";
import { HOURS } from "./modules/reloadable/utils.js";

await registerCommands(commandList);

clearClusterData();

const manager = new Manager(`bot.js`, {
  shardsPerClusters: 5,
  mode: "process",
  token: config.token,
  execArgv: ["--experimental-loader=./modules/loader.js"],
});

manager.on("clusterCreate", cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });

setTimeout(() => postServerCount(getClusterDataSum("guildCount")), 1 * HOURS);
