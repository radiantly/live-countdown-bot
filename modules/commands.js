import { botstatsCommand, botstatsHandler } from "./commands/botstats.js";
import { permcheckCommand, permcheckHandler } from "./commands/permcheck.js";
import { timerCommand, timerHandler } from "./commands/timer.js";
import { helpCommand, helpHandler } from "./commands/help.js";
import { countdownCommand, countdownHandler, countdownAutocomplete } from "./commands/countdown.js";
import { timestampCommand, timestampHandler, timestampAutocomplete } from "./commands/timestamp.js";
import { respawnCommand, respawnHandler } from "./commands/respawn.js";
import { deleteCommand, deleteHandler } from "./commands/delete.js";

export const interactionCreateHandler = async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === botstatsCommand.name) return await botstatsHandler(interaction);
    if (interaction.commandName === timerCommand.name) return await timerHandler(interaction);
    if (interaction.commandName === helpCommand.name) return await helpHandler(interaction);
    if (interaction.commandName === respawnCommand.name) return await respawnHandler(interaction);
    if (interaction.commandName === deleteCommand.name) return await deleteHandler(interaction);
    if (interaction.commandName === permcheckCommand.name)
      return await permcheckHandler(interaction);
    if (interaction.commandName === countdownCommand.name)
      return await countdownHandler(interaction);
    if (interaction.commandName === timestampCommand.name)
      return await timestampHandler(interaction);
  }
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === countdownCommand.name)
      return await countdownAutocomplete(interaction);

    if (interaction.commandName === timestampCommand.name)
      return await timestampAutocomplete(interaction);
  }
};

// Re-export all commands
export {
  botstatsCommand,
  permcheckCommand,
  timerCommand,
  helpCommand,
  countdownCommand,
  timestampCommand,
  respawnCommand,
  deleteCommand,
};
