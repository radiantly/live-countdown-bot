import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isOwner } from "../helpers.js";

export const reloadCommand = new SlashCommandBuilder()
  .setName("reload")
  .setDescription("Reload reloadables")
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  if (!isOwner(interaction.user.id)) {
    console.error(`Unauthorized reload by user ${interaction.user.id}`);
    return interaction.reply({
      content: "Yeah.. you're not supposed to be able to do that",
      ephemeral: true,
    });
  }

  await interaction.reply({ content: "Authorization success. Queuing reload.", ephemeral: true });
  (await import("../../../bot.js")).broadcastReload();
};

export const handlers = {
  command: reloadCommand,
  chatInput: chatInputHandler,
};
