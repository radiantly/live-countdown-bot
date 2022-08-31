import { cleanContent } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { insertCountdown } from "../sqlite3.js";
import { DAYS, HOURS, MINUTES, SECONDS, toSecs } from "../utils.js";

const options = {
  seconds: "seconds",
  minutes: "minutes",
  hours: "hours",
  days: "days",
  reason: "reason",
};

export const timerCommand = new SlashCommandBuilder()
  .setName("timer")
  .setDescription("Set a timer")
  .addIntegerOption(option =>
    option.setName(options.seconds).setDescription("Number of seconds to set the timer for")
  )
  .addIntegerOption(option =>
    option.setName(options.minutes).setDescription("Number of minutes to set the timer for")
  )
  .addIntegerOption(option =>
    option.setName(options.hours).setDescription("Number of hours to set the timer for")
  )
  .addIntegerOption(option =>
    option.setName(options.days).setDescription("Number of days to set the timer for")
  )
  .addStringOption(option => option.setName(options.reason).setDescription("Description"));

export const timerHandler = async interaction => {
  const seconds = interaction.options.getInteger(options.seconds) ?? 0;
  const minutes = interaction.options.getInteger(options.minutes) ?? 0;
  const hours = interaction.options.getInteger(options.hours) ?? 0;
  const days = interaction.options.getInteger(options.days) ?? 0;
  const reasonRaw = interaction.options.getString(options.reason) ?? "";
  const reason = cleanContent(reasonRaw, interaction.channel);

  const duration = seconds * SECONDS + minutes * MINUTES + hours * HOURS + days * DAYS;
  const timestamp = duration + Date.now();

  const message = await interaction.reply({
    content: `**${reason || "Timer ends"} <t:${toSecs(timestamp)}:R>**`,
    fetchReply: true,
  });

  if (duration < 5 * SECONDS) return;

  const timerData = {
    type: "timer",
    replyTo: message.id,
    reason,
  };

  insertCountdown(
    interaction.guildId,
    interaction.channelId,
    interaction.user.id,
    timestamp - 1 * SECONDS, // processing time
    timerData
  );
};
