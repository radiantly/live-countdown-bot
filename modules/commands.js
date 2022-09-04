import { BaseInteraction } from "discord.js";
import { botstatsHandlers } from "./commands/botstats.js";
import { countdownHandlers } from "./commands/countdown.js";
import { deleteHandlers } from "./commands/delete.js";
import { helpHandlers } from "./commands/help.js";
import { listHandlers } from "./commands/list.js";
import { permcheckHandlers } from "./commands/permcheck.js";
import { respawnHandlers } from "./commands/respawn.js";
import { timerHandlers } from "./commands/timer.js";
import { timestampHandlers } from "./commands/timestamp.js";

const allHandlers = [
  botstatsHandlers,
  countdownHandlers,
  deleteHandlers,
  helpHandlers,
  listHandlers,
  permcheckHandlers,
  respawnHandlers,
  timerHandlers,
  timestampHandlers,
];

const chatInputHandlers = allHandlers.reduce((obj, handlers) => {
  if (handlers.chatInput) obj[handlers.command.name] = handlers.chatInput;
  return obj;
}, {});

const autocompleteHandlers = allHandlers.reduce((obj, handlers) => {
  if (handlers.autocomplete) obj[handlers.command.name] = handlers.autocomplete;
  return obj;
}, {});

const selectMenuHandlers = allHandlers.reduce((obj, handlers) => {
  for (const { customId, handler: selectMenuHandler } of handlers.selectMenu ?? [])
    obj[customId] = selectMenuHandler;
  return obj;
}, {});

/**
 * Handles interactions
 * @param {BaseInteraction} interaction
 * @returns
 */
export const interactionCreateHandler = async interaction => {
  if (interaction.isChatInputCommand())
    return await chatInputHandlers[interaction.commandName](interaction);
  if (interaction.isAutocomplete())
    return await autocompleteHandlers[interaction.commandName](interaction);
  if (interaction.isSelectMenu())
    return await selectMenuHandlers[interaction.customId](interaction);
};
