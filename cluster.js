import { Manager } from "discord-hybrid-sharding";
import { config } from "./config.js";

import {
  botstatsCommand,
  countdownCommand,
  permcheckCommand,
  respawnCommand,
  timerCommand,
  timestampCommand,
} from "./modules/commands.js";
import { registerCommands } from "./modules/register.js";

const commandList = [
  {
    config: "dev",
    guildId: "725326756546084954",
    commands: [
      botstatsCommand,
      permcheckCommand,
      timerCommand,
      countdownCommand,
      timestampCommand,
      respawnCommand,
    ],
  },
  {
    config: "dev",
    commands: [],
  },
  {
    config: "production",
    commands: [botstatsCommand],
  },
  {
    config: "production",
    guildId: "719541990580289557",
    commands: [respawnCommand, timestampCommand],
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
