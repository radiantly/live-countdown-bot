import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { extractRolesFromString, generateAllowedMentions } from "../helpers.js";
import { getUserData, insertCountdown, setUserData } from "../sqlite3.js";
import { DAYS, HOURS, MINUTES, SECONDS, toSecs } from "../utils.js";

const options = {
  seconds: "seconds",
  minutes: "minutes",
  hours: "hours",
  days: "days",
  reason: "reason",
  mention: "mention",
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
  .addStringOption(option => option.setName(options.reason).setDescription("Description"))
  .addMentionableOption(option =>
    option.setName(options.mention).setDescription("Mention someone once the timer is done")
  )
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  const seconds = interaction.options.getInteger(options.seconds) ?? 0;
  const minutes = interaction.options.getInteger(options.minutes) ?? 0;
  const hours = interaction.options.getInteger(options.hours) ?? 0;
  const days = interaction.options.getInteger(options.days) ?? 0;
  const reason = interaction.options.getString(options.reason) ?? "";
  const mention = interaction.options.getMentionable(options.mention) ?? null;

  let duration = seconds * SECONDS + minutes * MINUTES + hours * HOURS + days * DAYS;

  // If the user has run /timer without arguments
  if (duration === 0) {
    // then retrieve the duration of the last timer set
    duration = getUserData(interaction.user.id)?.lastTimerDuration;

    // if that does not exist, soft exit
    if (!duration)
      return interaction.reply({
        content:
          "This is the timer command! Pass in the number of seconds, minutes, hours or days to set a timer :timer:",
        ephemeral: true,
      });
  } else if (duration > 0) {
    setUserData(interaction.user.id, {
      lastTimerDuration: duration,
    });
  }

  const timestamp = duration + Date.now();

  const message = await interaction.reply({
    content: `**${reason || "Timer ends"} <t:${toSecs(timestamp)}:R>**`,
    fetchReply: true,
  });

  if (duration < 5 * SECONDS) return;

  const allMentions = extractRolesFromString(interaction.guild, reason);
  allMentions.push(mention);

  const timerData = {
    type: "timer",
    replyTo: message.id,
    reason,
    mention: mention?.toString(),
    allowedMentions: generateAllowedMentions(interaction.member, interaction.channel, allMentions),
    createdAt: Date.now(),
    authorTag: interaction.user.tag,
    channelName: interaction.channel.name,
  };

  insertCountdown(
    interaction.guildId,
    interaction.channelId,
    interaction.user.id,
    timestamp - 1 * SECONDS, // processing time
    timerData
  );
};

export const timerHandlers = {
  command: timerCommand,
  chatInput: chatInputHandler,
};
