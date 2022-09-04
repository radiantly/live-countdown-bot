import { EmbedBuilder } from "discord.js";
import {
  User,
  SlashCommandBuilder,
  PermissionsBitField,
  ChatInputCommandInteraction,
} from "discord.js";
import { getGuildCountdowns } from "../sqlite3.js";
import { toSecs } from "../utils.js";

export const listCommand = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List all timers and countdowns")
  .setDMPermission(false);
// TODO: list from certain user

// buttons:
// show all
//

const nothingFoundEmbed = new EmbedBuilder()
  .setTitle("No countdowns or timers found!")
  .setDescription(
    "For timers or countdowns to show up in this list, a `reason` must be provided when creating a timer or countdown."
  );

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  const results = getGuildCountdowns({ guildId: interaction.guildId });

  if (results.length === 0)
    return interaction.reply({
      embeds: [nothingFoundEmbed],
      ephemeral: true,
    });

  const timers = results.filter(({ data: { type, reason } }) => reason && type === "timer");
  // const countdowns = results.filter(({ data: { type } }) => reason && type === "countdown");

  const formatLine = ({ updateTime, data: { reason } }) => {
    return "ji";
    // `<t:${toSecs(updateTime)}:f> ${reason}`;
  };

  const resultEmbed = new EmbedBuilder()
    .setTitle(`Countdowns and Timers in ${interaction.guild.name}`)
    .addFields({
      name: "Timers",
      value: timers.map(formatLine).join("\n"),
    });

  return interaction.reply({
    embeds: [resultEmbed],
    ephemeral: true,
  });
};

export const listHandlers = {
  command: listCommand,
  chatInput: chatInputHandler,
};
