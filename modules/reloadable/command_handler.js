import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BaseInteraction } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");

const allHandlers = (
  await Promise.all(
    fs
      .readdirSync(commandsPath)
      .filter(file => file.endsWith(".js"))
      .map(filePath => import(path.resolve(commandsPath, filePath)))
  )
).map(commandFileModule => commandFileModule.handlers);

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
  if (interaction.isChatInputCommand()) {
    await chatInputHandlers[interaction.commandName](interaction);
  } else if (interaction.isAutocomplete()) {
    await autocompleteHandlers[interaction.commandName](interaction);
  } else if (interaction.isSelectMenu()) {
    await selectMenuHandlers[interaction.customId](interaction);
  }
};
