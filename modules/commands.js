import { botstatsCommand, botstatsHandler } from "./commands/botstats.js";
import { permcheckCommand, permcheckHandler } from "./commands/permcheck.js";
import { timerCommand, timerHandler } from "./commands/timer.js";

export const interactionCreateHandler = async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === botstatsCommand.name) return await botstatsHandler(interaction);
    else if (interaction.commandName === permcheckCommand.name)
      return await permcheckHandler(interaction);
    else if (interaction.commandName === timerCommand.name) return await timerHandler(interaction);
  }
};

// Re-export all commands
export { botstatsCommand, permcheckCommand, timerCommand };
