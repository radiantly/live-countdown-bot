import { Manager } from "discord-hybrid-sharding";
import { config } from "./config.js";
import { botstatsCommand } from "./modules/commands/botstats.js";
import { countdownCommand } from "./modules/commands/countdown.js";
import { deleteCommand } from "./modules/commands/delete.js";
import { helpCommand } from "./modules/commands/help.js";
import { listCommand } from "./modules/commands/list.js";
import { permcheckCommand } from "./modules/commands/permcheck.js";
import { respawnCommand } from "./modules/commands/respawn.js";
import { timerCommand } from "./modules/commands/timer.js";
import { timestampCommand } from "./modules/commands/timestamp.js";
import { registerCommands } from "./modules/register.js";

const commandList = [
  {
    config: "dev",
    guildId: "725326756546084954",
    commands: [
      botstatsCommand,
      countdownCommand,
      deleteCommand,
      helpCommand,
      listCommand,
      permcheckCommand,
      respawnCommand,
      timerCommand,
      timestampCommand,
    ],
  },
  {
    config: "dev",
    commands: [],
  },
  {
    config: "production",
    commands: [botstatsCommand, deleteCommand, helpCommand, timerCommand, timestampCommand],
  },
  {
    config: "production",
    guildId: "719541990580289557",
    commands: [respawnCommand],
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
