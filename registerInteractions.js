import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { command as timerCommand } from "./modules/commands/timer.js";
import { command as permissionCheckCommand } from "./modules/commands/permissionCheck.js";
import { command as remindMeInCommand } from "./modules/commands/remindMeIn.js";
import { command as sendToDM } from "./modules/commands/sendToDM.js";

import config from "./config.js";

const { token, clientId, supportGuildId: guildId } = config;
const guildCommands = [timerCommand, permissionCheckCommand, remindMeInCommand, sendToDM];
const globalCommands = [];

const rest = new REST({ version: "9" }).setToken(token);

console.log("Started refreshing application (/) commands.");
console.log(process.argv);
if (process.argv[2] === "--global")
  await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
else await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands });

console.log("Successfully reloaded application (/) commands.");
