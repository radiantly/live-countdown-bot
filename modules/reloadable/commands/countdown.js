import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Fuse from "fuse.js";
import { parseUserTimeString } from "../dateparser.js";
import { MAX_AUTOCOMPLETE_CHOICES, MAX_LENGTH_STRING_CHOICE, SECONDS } from "../utils.js";
import { DateTime } from "luxon";
import { extractRolesFromString, generateAllowedMentions } from "../helpers.js";
import { getUserData } from "../sqlite3.js";
import { updateQueue } from "../../update_queue.js";

const examples = [
  "10 minutes",
  "25th December",
  "18:30 4 Oct CEST",
  "7 am tomorrow",
  "14th Nov 12:15PM GMT+0530",
  "2pm monday",
  "January 12, 2012 10:00 PM EST",
  "4 hours 56 mins",
].map(example => ({ name: example, value: example }));

export const INVALID_VALUE = "THE_OPTION_THAT_MUST_NOT_BE_USED";

const availableTimeZones = Intl.supportedValuesOf("timeZone");
const fuse = new Fuse(availableTimeZones);

export const OptionName = Object.freeze({
  datetime: "datetime",
  timezone: "timezone",
  reason: "reason",
  mention: "mention",
});

export const countdownCommand = new SlashCommandBuilder()
  .setName("countdown")
  .setDescription("Set a countdown")
  .addStringOption(option =>
    option
      .setName(OptionName.datetime)
      .setDescription("The date/time you want to countdown to")
      .setRequired(true)
      .setAutocomplete(true)
      .setMaxLength(MAX_LENGTH_STRING_CHOICE)
  )
  .addStringOption(option =>
    option.setName(OptionName.timezone).setDescription("Current timezone").setAutocomplete(true)
  )
  .addStringOption(option => option.setName(OptionName.reason).setDescription("Description"))
  .addMentionableOption(option =>
    option.setName(OptionName.mention).setDescription("Mention someone once the timer is done")
  )
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  const datetimeText = interaction.options.getString(OptionName.datetime);
  const timezoneInput = interaction.options.getString(OptionName.timezone);
  const reason = interaction.options.getString(OptionName.reason) ?? "";
  const mention = interaction.options.getMentionable(OptionName.mention) ?? null;

  if (datetimeText === INVALID_VALUE) {
    return interaction.reply({
      content: `Hey ${interaction.user}! This option isn't valid, try entering a date or time to set a countdown.`,
    });
  }

  console.log("cdH", datetimeText, timezoneInput);
  const {
    error,
    timestamp: timestampSec,
    timezone,
  } = await parseUserTimeString(interaction.user, datetimeText, timezoneInput, true);
  if (error)
    return interaction.reply({
      content: error,
      ephemeral: true,
    });

  console.log(timezone);
  const message = await interaction.reply({
    content: `**${reason || "Countdown ends"} <t:${timestampSec}:R>**`,
    fetchReply: true,
  });

  const duration = timestampSec * 1000 - Date.now();
  if (duration < 5 * SECONDS) return;

  const allMentions = extractRolesFromString(interaction.guild, reason);
  allMentions.push(mention);

  const countdownData = {
    type: "countdown",
    replyTo: message.id,
    reason,
    mention: mention?.toString(),
    allowedMentions: generateAllowedMentions(interaction.member, interaction.channel, allMentions),
    createdAt: Date.now(),
    authorTag: interaction.user.tag,
    channelName: interaction.channel.name,
  };

  updateQueue.insert({
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    authorId: interaction.user.id,
    updateTime: (timestampSec - 1) * SECONDS, // processing time
    data: countdownData,
  });
};

const autocompleteOptionHandlers = {};

autocompleteOptionHandlers[OptionName.timezone] = async (_, value) => {
  const choices = fuse
    .search(value, { limit: MAX_AUTOCOMPLETE_CHOICES })
    .map(result => ({ name: result.item, value: result.item }));

  if (choices.length) return choices;

  const sliced = value.slice(0, MAX_LENGTH_STRING_CHOICE) || "UTC";
  return [{ name: sliced, value: sliced }];
};

autocompleteOptionHandlers[OptionName.datetime] = async (interaction, value) => {
  // when input is empty
  if (!value) {
    // default first suggestion
    let first_suggestion = {
      name: "Note: the following options are just examples, try typing your own!",
      value: INVALID_VALUE,
    };

    // if the user has used the bot before, suggest them their last input instead
    const lastText = getUserData(interaction.user.id)?.lastCountdownText;
    if (lastText) first_suggestion.name = first_suggestion.value = lastText;

    return [first_suggestion, ...examples];
  }

  const timezoneInput = interaction.options.getString(OptionName.timezone) ?? null;

  const {
    error,
    timestamp: timestampSec,
    timezone,
    utcoffset,
  } = await parseUserTimeString(interaction.user, value, timezoneInput);

  console.log(error, timestampSec, timezone, utcoffset);

  value = value.substring(0, MAX_LENGTH_STRING_CHOICE);

  if (error) return [{ name: value, value }];

  // Now, this is a sort of hack to get what we want.
  // the timezone returned  might be one that luxon does not support
  // So, for the datetime we'll strictly be working with the UTC
  // offset for the localized string generation

  const dt = DateTime.fromSeconds(timestampSec + utcoffset, {
    locale: interaction.locale,
    zone: "utc",
  });

  const suggestion = `${value.substring(0, 50)} (${dt.toLocaleString(
    DateTime.DATETIME_MED
  )} ${timezone})`;
  return [{ name: suggestion, value }];
};

const autocompleteHandler = async interaction => {
  const { name, value } = interaction.options.getFocused(true);

  interaction.respond((await autocompleteOptionHandlers[name](interaction, value)) || []);
};

export const handlers = {
  command: countdownCommand,
  chatInput: chatInputHandler,
  autocomplete: autocompleteHandler,
};
