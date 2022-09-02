import { SlashCommandBuilder } from "discord.js";
import Fuse from "fuse.js";
import { parseTimeString } from "../dateparser.js";
import { MAX_AUTOCOMPLETE_CHOICES, MAX_LENGTH_STRING_CHOICE } from "../utils.js";
import { DateTime } from "luxon";

const availableTimeZones = Intl.supportedValuesOf("timeZone");
const fuse = new Fuse(availableTimeZones);

export const OptionName = Object.freeze({
  datetime: "datetime",
  timezone: "timezone",
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
  )
  .addStringOption(option =>
    option.setName(OptionName.timezone).setDescription("Current timezone").setAutocomplete(true)
  );

export const countdownHandler = async interaction => {
  const datetimeText = interaction.options.getString(OptionName.datetime);
  const timezoneInput = interaction.options.getString(OptionName.timezone) ?? null;

  console.log("cdH", datetimeText, timezoneInput);
  const {
    error,
    timestamp: timestampSec,
    timezone,
  } = await parseTimeString(datetimeText, timezoneInput);
  if (error)
    return interaction.reply({
      content: error,
      ephemeral: true,
    });

  console.log(timezone);
  return interaction.reply(`Countdown ends <t:${timestampSec}:R>`);
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
  if (!value) return [];

  const timezoneInput = interaction.options.getString(OptionName.timezone) ?? null;

  const {
    error,
    timestamp: timestampSec,
    timezone,
    utcoffset,
  } = await parseTimeString(value, timezoneInput);

  console.log(error, timestampSec, timezone, utcoffset);

  if (error) return [];

  // Now, this is a sort of hack to get what we want.
  // the timezone returned by parseTimeString might be one that luxon does
  // not support. So for the datetime we'll strictly be working with the UTC
  // offset for the localized string generation

  const dt = DateTime.fromSeconds(timestampSec + utcoffset, {
    locale: interaction.locale,
    zone: "utc",
  });

  const humanTime = `${dt.toLocaleString(DateTime.DATETIME_MED)} ${timezone}`;

  return [{ name: humanTime, value }];
};

export const countdownAutocomplete = async interaction => {
  const { name, value } = interaction.options.getFocused(true);

  interaction.respond((await autocompleteOptionHandlers[name](interaction, value)) || []);
};
