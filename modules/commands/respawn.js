import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isOwner } from "../helpers.js";

export const respawnCommand = new SlashCommandBuilder()
  .setName("respawn")
  .setDescription("Respawn all bot clusters")
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  if (!isOwner(interaction.user.id)) {
    console.error(`Unauthorized respawn by user ${interaction.user.id}`);
    return interaction.reply({
      content:
        "You don't seem to be the bot owner - which means you aren't allowed to schedule a respawn. This incident has been logged.",
      ephemeral: true,
    });
  }

  await interaction.reply({ content: "Authorization success. Queuing respawn.", ephemeral: true });
  interaction.client.cluster.respawnAll();
};

export const respawnHandlers = {
  command: respawnCommand,
  chatInput: chatInputHandler,
};
