import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction } from "discord.js";

const requiredPermissions = [
  [
    PermissionsBitField.Flags.ViewChannel,
    "View Channel",
    "I can't view the channel, let alone send messages - please give me the `View Channel` permission!",
  ],
  [
    PermissionsBitField.Flags.SendMessages,
    "Send Messages",
    "Without the send messages permission, I can't send any messages (apart from replies to slash commands)",
  ],
  [
    PermissionsBitField.Flags.ReadMessageHistory,
    "Read Message History",
    "I can't reply to messages without this permission :raised_hands:",
  ],
  [
    PermissionsBitField.Flags.EmbedLinks,
    "Embed Links",
    "With this permission I can send cool embeds :sunglasses:",
  ],
  [
    PermissionsBitField.Flags.MentionEveryone,
    "Mention @everyone, @here, and All Roles",
    "How can I tag everyone with your countdown if you don't give me this permission?",
  ],
  [
    PermissionsBitField.Flags.ManageMessages,
    "Manage Messages",
    "To delete messages I need this permission",
  ],
];

export const permcheckCommand = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Check bot")
  .addSubcommand(subcommand =>
    subcommand
      .setName("permissions")
      .setDescription("Check if the Live Countdown bot has been granted permissions correctly")
  )
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  if (!interaction.channel || !interaction.guild?.available || !interaction.guild.members.me)
    return interaction.reply({
      content: "Unknown error. Please report this at the support server.",
      ephemeral: true,
    });

  return interaction.reply({
    content: requiredPermissions
      .map(([permBit, permName, permReason]) =>
        interaction.guild.members.me.permissionsIn(interaction.channel).has(permBit)
          ? `:white_check_mark: **${permName}**`
          : `:x: **${permName}** *${permReason}*`
      )
      .join("\n"),
    ephemeral: true,
  });
};

export const permcheckHandlers = {
  command: permcheckCommand,
  chatInput: chatInputHandler,
};
