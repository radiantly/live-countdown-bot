import { SlashCommandBuilder } from "discord.js";

export const botstatsCommand = new SlashCommandBuilder()
  .setName("botstats")
  .setDescription("Check bot statistics!");
