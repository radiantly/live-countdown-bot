import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction } from "discord.js";

export const deleteCommand = new SlashCommandBuilder()
  .setName("delete")
  .setDescription("Delete timers/countdowns")
  .addSubcommand(subcommand =>
    subcommand
      .setName("single")
      .setDescription("Delete a single timer or countdown")
      .addStringOption(option =>
        option
          .setName("message_id")
          .setDescription("The message ID of the countdown or timer you would like to delete")
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("all")
      .setDescription("Delete all timers and countdowns in the server")
      .addChannelOption(option =>
        option.setName("in").setDescription("Delete all countdowns in specified channel")
      )
      .addUserOption(option =>
        option.setName("from").setDescription("Delete all countdowns from specified user")
      )
  );

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
export const deleteHandler = async interaction => {
  const type = interaction.options.getSubcommand();

  interaction.reply({
    content: `Got your message. ${type}`,
    ephemeral: true,
  });
};
