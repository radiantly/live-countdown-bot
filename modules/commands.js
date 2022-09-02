import { botstatsCommand, botstatsHandler } from "./commands/botstats.js";
import { permcheckCommand, permcheckHandler } from "./commands/permcheck.js";
import { timerCommand, timerHandler } from "./commands/timer.js";
import { helpCommand, helpHandler } from "./commands/help.js";
import { countdownCommand, countdownHandler, countdownAutocomplete } from "./commands/countdown.js";
import { timestampCommand, timestampHandler, timestampAutocomplete } from "./commands/timestamp.js";

export const interactionCreateHandler = async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === botstatsCommand.name) return await botstatsHandler(interaction);
    else if (interaction.commandName === permcheckCommand.name)
      return await permcheckHandler(interaction);
    else if (interaction.commandName === timerCommand.name) return await timerHandler(interaction);
    else if (interaction.commandName === helpCommand.name) return await helpHandler(interaction);
    else if (interaction.commandName === countdownCommand.name)
      return await countdownHandler(interaction);
    else if (interaction.commandName === timestampCommand.name)
      return await timestampHandler(interaction);
  } else if (interaction.isAutocomplete()) {
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
};
