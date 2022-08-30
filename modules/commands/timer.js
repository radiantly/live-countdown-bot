import { SlashCommandBuilder } from "discord.js";
import { DAYS, HOURS, MINUTES, SECONDS } from "../utils.js";

const options = {
  seconds: "seconds",
  minutes: "minutes",
  hours: "hours",
  days: "days",
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
  .addStringOption(option => option.setName("reason").setDescription("Description"));

export const timerHandler = async interaction => {
  const seconds = interaction.options.getInteger(options.seconds) ?? 0;
  const minutes = interaction.options.getInteger(options.minutes) ?? 0;
  const hours = interaction.options.getInteger(options.hours) ?? 0;
  const days = interaction.options.getInteger(options.days) ?? 0;

  const duration = seconds * SECONDS + minutes * MINUTES + hours * HOURS + days * DAYS;
  const timestamp = Math.floor((duration + interaction.createdTimestamp) / 1000);

  interaction.reply(`<t:${timestamp}:R>`);
};
