import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
import { config } from "../config.js";
import { kv } from "./reloadable/sqlite3.js";
import hash from "object-hash";

export const registerCommands = async commandList => {
  const rest = new REST({ version: "10" }).setToken(config.token);

  for (let { config: confName, guildId, commands } of commandList) {
    if (confName !== config.name) continue;

    // So that we can send it through the API
    commands = commands.map(command => command.toJSON());

    // Check if we've already registered these commands
    const commandsHash = hash(commands);
    const cacheKey = `commands:${config.botId}:${guildId || "global"}`;
    if (kv[cacheKey] === commandsHash) continue;

    const route = guildId
      ? Routes.applicationGuildCommands(config.botId, guildId)
      : Routes.applicationCommands(config.botId);

    await rest.put(route, { body: commands });

    console.log(`Registered ${cacheKey}:${commandsHash}`);

    kv[cacheKey] = commandsHash;
  }
};
