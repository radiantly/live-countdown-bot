import { SlashCommandBuilder } from "discord.js";
import { config } from "../../config.js";

export const respawnCommand = new SlashCommandBuilder()
  .setName("respawn")
  .setDescription("Respawn all bot clusters")
  .setDefaultMemberPermissions(0);

export const respawnHandler = async interaction => {
  if (interaction.user.id !== config.ownerId) {
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
