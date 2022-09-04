import {
  SelectMenuBuilder,
  ActionRowBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SelectMenuInteraction,
} from "discord.js";
import { DateTime } from "luxon";
import { deleteCountdown, getCountdown, getGuildCountdowns } from "../sqlite3.js";

export const deleteCommand = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("Delete timers or countdowns set")
  .setDMPermission(false);

const generateMessage = ({ guildId, locale }) => {
  const all = getGuildCountdowns({ guildId });
  console.log(all);

  if (!all?.length)
    return {
      content: "No items found.",
      ephemeral: true,
    };

  const selectRow = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId("delete_select")
      .setPlaceholder("What would you like to delete?")
      .addOptions(
        ...all.map(({ rowid, data: { createdAt } }) => {
          const createdRel = DateTime.fromMillis(createdAt, {
            locale,
            zone: "utc",
          }).toRelative();

          return {
            label: "Created <t:0> <@713331783214825522>",
            description: `Created ${createdRel}`,
            value: rowid.toString(),
          };
        })
      )
      .setMaxValues(all.length)
  );

  return {
    content: "Select the messages you would like to delete:",
    components: [selectRow],
    ephemeral: true,
  };
};

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const deleteHandler = async interaction => interaction.reply(generateMessage(interaction));

/**
 * Handles the select menu
 * @param {SelectMenuInteraction} interaction
 */
const deleteSelectHandler = async interaction => {
  for (const rowid of interaction.values) {
    const row = getCountdown(rowid);
    if (!row) continue;
    const { authorId } = row;

    // Check permissions
    // if (authorId !== interaction.user.id) continue;
    // TODO: Check MANAGE_MESSAGES

    deleteCountdown(rowid);
  }
  interaction.update(generateMessage(interaction));
};

export const deleteHandlers = {
  command: deleteCommand,
  chatInput: deleteHandler,
  selectMenu: [
    {
      customId: "delete_select",
      handler: deleteSelectHandler,
    },
  ],
};
