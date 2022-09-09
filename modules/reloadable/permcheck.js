import { PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";

const requiredPermissions = [
  [
    PermissionFlagsBits.ViewChannel,
    "View Channel",
    "I can't view this channel, let alone send messages - please give me this permission!",
  ],
  [
    PermissionFlagsBits.SendMessages,
    "Send Messages",
    "Without this permission, I can't send any messages (apart from replies to slash commands)",
  ],
  [
    PermissionFlagsBits.ReadMessageHistory,
    "Read Message History",
    "I can't reply or react to messages without this permission :raised_hands:",
  ],
  [
    PermissionFlagsBits.EmbedLinks,
    "Embed Links",
    "With this permission I can send cool embeds :sunglasses:",
  ],
  [
    PermissionFlagsBits.MentionEveryone,
    "Mention @everyone, @here, and All Roles",
    "How can I tag everyone with your countdown if you don't give me this permission?",
  ],
  [
    PermissionFlagsBits.ManageMessages,
    "Manage Messages",
    "I need this permission to delete messages",
  ],
];

/**
 * Get summary of permissions required for bot operation
 * @param {ChatInputCommandInteraction} interaction
 */
export const getPermissionsSummary = interaction => {
  if (!interaction.channel || !interaction.guild?.available || !interaction.guild.members.me)
    return null;

  let permIssues = false;
  const summary = requiredPermissions
    .map(([permBit, permName, permReason]) => {
      if (interaction.guild.members.me.permissionsIn(interaction.channel).has(permBit))
        return `:white_check_mark: **${permName}**`;
      permIssues = true;
      return `:x: **${permName}** *${permReason}*`;
    })
    .join("\n");

  return permIssues ? summary : null;
};
