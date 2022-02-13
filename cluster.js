import Cluster from "discord-hybrid-sharding";
import config from "./config.js";
import { updateClusterInfo, getClusterStats } from "./modules/sqlite3.js";
import { postServerCount } from "./modules/post.js";

updateClusterInfo(-1, 0, process.memoryUsage().rss);

const manager = new Cluster.Manager("./modules/bot.js", {
  shardsPerClusters: 5,
  mode: "process",
  token: config.token,
});

manager.on("clusterCreate", cluster => console.log(`Launched cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });

// Post server counts to bot lists hourly.
setInterval(() => postServerCount(getClusterStats()["TOTAL(GuildCount)"]), 60 * 60 * 1000);
