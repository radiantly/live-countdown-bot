import { timerCommand, timerExecute } from "./timer.js";
import { permissionCheckCommand, permissionCheckExecute } from "./permissionCheck.js";
export const interactionHandler = interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (commandName === timerCommand.name) return timerExecute(interaction);
  if (commandName === permissionCheckCommand.name) return permissionCheckExecute(interaction);
};
