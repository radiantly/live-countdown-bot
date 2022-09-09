import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { getPermissionsSummary } from "../permcheck.js";

export const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Help menu for the Live Countdown bot!");

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  const embeds = [];

  // if the current user has the manage roles permission, show them missing permissions
  if (
    interaction.member instanceof GuildMember &&
    interaction.member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageRoles)
  ) {
    const missingPermissions = getPermissionsSummary(interaction);
    if (missingPermissions) {
      const permsEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("Missing Permissions!")
        .setDescription(missingPermissions);
      embeds.push(permsEmbed);
    }
  }

  const helpEmbed = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setTitle("Live Countdown bot Help Menu")
    .addFields(
      {
        name: "This help menu is under construction!",
        value:
          "On <t:1661904000:D>, Discord made message intents privileged - which means that the Live Countdown bot can't function like it used to.",
      },
      {
        name: "All is good though!",
        value:
          "Not to worry - The bot should be functional in around a week once the team has completed migration and deployed the new version of the bot.",
      }
    );
  embeds.push(helpEmbed);

  interaction.reply({ embeds, ephemeral: true });
};

export const handlers = {
  command: helpCommand,
  chatInput: chatInputHandler,
};
