import { Manager } from "discord-hybrid-sharding";
import { config } from "./config.js";

import {
  botstatsCommand,
  countdownCommand,
  permcheckCommand,
  timerCommand,
  timestampCommand,
} from "./modules/commands.js";
import { registerCommands } from "./modules/register.js";

const commandList = [
  {
    config: "dev",
    guildId: "725326756546084954",
    commands: [botstatsCommand, permcheckCommand, timerCommand, countdownCommand, timestampCommand],
  },
  {
    config: "dev",
    commands: [],
  },
  {
    config: "production",
    commands: [botstatsCommand],
  },
];

await registerCommands(commandList);

const manager = new Manager(`bot.js`, {
  shardsPerClusters: 7,
  mode: "process",
  token: config.token,
});

manager.on("clusterCreate", cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });
