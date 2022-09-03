import {
  EmbedBuilder,
  inlineCode,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { countdownAutocomplete, OptionName as countdownOptionName } from "./countdown.js";
import { parseUserTimeString } from "../dateparser.js";

const OptionName = Object.freeze({
  format: "format",
  ...countdownOptionName,
});

const formats = {
  "Short Time": "t",
  "Long Time": "T",
  "Short Date": "d",
  "Long Date": "D",
  "Short Date/Time": "f",
  "Long Date/Time": "F",
  "Relative Time": "R",
};

export const timestampCommand = new SlashCommandBuilder()
  .setName("timestamp")
  .setDescription("Generate a Discord time tag for a given date and time")
  .addStringOption(option =>
    option
      .setName(OptionName.datetime)
      .setDescription("The date/time for the timestamp")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName(OptionName.timezone).setDescription("Current timezone").setAutocomplete(true)
  )
  .addStringOption(option =>
    option
      .setName(OptionName.format)
      .setDescription("Formatting of the generated time tag")
      .addChoices(
        { name: "Show all", value: "all" },
        ...Object.entries(formats).map(([name, value]) => ({ name, value }))
      )
  );

export const timestampAutocomplete = countdownAutocomplete;

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
export const timestampHandler = async interaction => {
  const datetimeText = interaction.options.getString(OptionName.datetime);
  const timezoneInput = interaction.options.getString(OptionName.timezone);
  const formatType = interaction.options.getString(OptionName.format) ?? "all";

  console.log("cdT", datetimeText, timezoneInput);
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

  const generateTag = format => `<t:${timestampSec}:${format}>`;

  if (formatType !== "all") {
    const timeTag = generateTag(formatType);
    return interaction.reply({
      content: `Generated successfully! Copy \`${timeTag}\` to get ${timeTag}`,
      ephemeral: true,
    });
  }

  console.log(timezone);

  const embed = new EmbedBuilder().setTitle("Here are the timestamps you wanted!").addFields({
    name: "Copy..  to get:",
    value: Object.values(formats)
      .map(format => `${inlineCode(generateTag(format))} ${generateTag(format)}`)
      .join("\n"),
  });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
};
