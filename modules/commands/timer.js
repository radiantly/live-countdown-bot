import { SlashCommandBuilder } from "@discordjs/builders";
import chrono from "chrono-node";

export const command = new SlashCommandBuilder()
  .setName("countdown")
  .setDescription("Start a countdown")
  .addStringOption(option =>
    option.setName("datetime").setDescription("The Date/Time to countdown to").setRequired(true)
  )
  .addMentionableOption(option =>
    option.setName("mention").setDescription("User or role to mention once the countdown is done")
  );

export const handler = async interaction => {
  const datetime = interaction.options.getString("datetime");
  const mention = interaction.options.getMentionable("mention");

  const parsedDate = chrono.parseDate(datetime, undefined, { forwardDate: true });
  if (!parsedDate) return interaction.reply({ content: "Invalid Date/Time", ephemeral: true });
  return interaction.reply(`Countdown done <t:${Math.round(parsedDate / 1000)}:R>`);
};
