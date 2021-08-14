import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { timerCommand } from "./modules/timer.js";
import { permissionCheckCommand } from "./modules/permissionCheck.js";
import config from "./config.js";

const { token, clientId, supportGuildId: guildId } = config;
const guildCommands = [timerCommand, permissionCheckCommand];
const globalCommands = [];

const rest = new REST({ version: "9" }).setToken(token);

console.log("Started refreshing application (/) commands.");
console.log(process.argv);
if (process.argv[2] === "--global")
  await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
else await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands });

console.log("Successfully reloaded application (/) commands.");
