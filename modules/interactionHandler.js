import { timerCommand, timerExecute } from "./timer.js";
export const interactionHandler = interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (commandName === timerCommand.name) return timerExecute(interaction);
};
