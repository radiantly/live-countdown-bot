import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Help menu for the Live Countdown bot!");

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
export const helpHandler = async interaction => {
  const embed = new EmbedBuilder()
    .setColor("#f26522")
    .setTitle("Live Countdown bot Help Menu")
    .addFields(
      {
        name: "This help menu is under construction!",
        value:
          "On <t:1661904000:D>, Discord made message intents privileged - which means that the Live Countdown bot can't function like it used to.",
      },
      {
        name: "All is good though!",
        value:
          "Not to worry - The bot should be functional in a few days once the team has completed migration and deployed the new version of the bot.",
      }
    );

  interaction.reply({ embeds: [embed], ephemeral: true });
};
