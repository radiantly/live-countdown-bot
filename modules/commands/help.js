import { EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Help menu for the Live Countdown bot!");

export const helpHandler = async interaction => {
  const embed = new EmbedBuilder().setColor("#f26522").setTitle("Live Countdown bot Help Menu");

  interaction.reply({ embeds: [embed], ephemeral: true });
};
