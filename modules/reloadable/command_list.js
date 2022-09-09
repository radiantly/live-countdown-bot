import { botstatsCommand } from "./commands/botstats.js";
import { countdownCommand } from "./commands/countdown.js";
import { deleteCommand } from "./commands/delete.js";
import { helpCommand } from "./commands/help.js";
import { listCommand } from "./commands/list.js";
import { newsitemCommand } from "./commands/newsitem.js";
import { pleaseCommand } from "./commands/please.js";
import { timerCommand } from "./commands/timer.js";
import { timestampCommand } from "./commands/timestamp.js";

export const commandList = [
  {
    config: "dev",
    guildId: "725326756546084954",
    commands: [
      botstatsCommand,
      countdownCommand,
      deleteCommand,
      helpCommand,
      listCommand,
      newsitemCommand,
      pleaseCommand,
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
    commands: [
      botstatsCommand,
      countdownCommand,
      deleteCommand,
      helpCommand,
      timerCommand,
      timestampCommand,
    ],
  },
  {
    config: "production",
    guildId: "719541990580289557",
    commands: [newsitemCommand, pleaseCommand],
  },
];
