import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";

const {
  FLAGS: { VIEW_CHANNEL, SEND_MESSAGES, EMBED_LINKS, MANAGE_MESSAGES },
} = Permissions;

const permissionsRequired = [
  [VIEW_CHANNEL, "View Channel", "This permission is required to read messages in this channel"],
  [SEND_MESSAGES, "Send Messages", "This permission is required for the bot to send messages"],
  [EMBED_LINKS, "Embed Links", "This permission is required to show embeds in the channel"],
  [
    MANAGE_MESSAGES,
    "Manage Messages",
    "This permission allows the bot to delete the initial countdown message",
  ],
];

export const permissionCheckCommand = new SlashCommandBuilder()
  .setName("permissioncheck")
  .setDescription("Check if bot permissions are correct in this channel");

export const permissionCheckExecute = async interaction => {
  if (!interaction.channel || !interaction.guild?.me)
    return interaction.reply({
      content: "Unknown error. Try reinviting the bot from https://top.gg/bot/710486805836988507",
      ephemeral: true,
    });

  return interaction.reply({
    content: permissionsRequired
      .map(([permission, permName, permReason]) =>
        interaction.guild.me.permissionsIn(interaction.channel).has(permission)
          ? `**${permName}** :white_check_mark:`
          : `**${permName}** :x: *${permReason}*`
      )
      .join("\n"),
    ephemeral: true,
  });
};
