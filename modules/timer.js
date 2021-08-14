import { SlashCommandBuilder } from "@discordjs/builders";
import chrono from "chrono-node";

export const timerCommand = new SlashCommandBuilder()
  .setName("countdown")
  .setDescription("Start a countdown")
  .addStringOption(option =>
    option.setName("datetime").setDescription("The Date/Time to countdown to").setRequired(true)
  );

export const timerExecute = async interaction => {
  const datetime = interaction.options.getString("datetime");

  const parsedDate = chrono.parseDate(datetime, undefined, { forwardDate: true });
  if (!parsedDate) return interaction.reply({ content: "Invalid Date/Time", ephemeral: true });
  return interaction.reply(`Countdown done <t:${parsedDate / 1000}:R>`);
};
