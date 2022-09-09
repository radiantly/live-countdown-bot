import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { postServerCount } from "../../post.js";
import { isOwner } from "../helpers.js";
import { registerCommands } from "../register.js";
import { getClusterDataSum } from "../sqlite3.js";

export const pleaseCommand = new SlashCommandBuilder()
  .setName("please")
  .setDescription("Commands for the owner")
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addSubcommand(subcommand =>
    subcommand
      .setName("postservercount")
      .setDescription("Post server counts to top.gg and discord.bots.gg")
  )
  .addSubcommand(subcommand => subcommand.setName("register").setDescription("Register commands"))
  .addSubcommand(subcommand =>
    subcommand.setName("reload").setDescription("Reload code without a restart")
  );

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  if (!isOwner(interaction.user.id)) {
    console.error(`Unauthorized command usage by by user ${interaction.user}`);
    return interaction.reply({
      content: "I know you said please .. but that command is only for the owner.",
      ephemeral: true,
    });
  }

  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === "postservercount") {
    await interaction.deferReply({ ephemeral: true });
    const results = await postServerCount(getClusterDataSum("guildCount"));
    interaction.editReply({
      content: `Status: ${results.join(", ") || "No API keys found."}`,
      ephemeral: true,
    });
  } else if (subcommand === "register") {
    interaction.reply({
      content: "Registering commands..",
      ephemeral: true,
    });
    // why dynamically import? to prevent a circular import
    // to use a static import, we'd need to separate the command and handler
    registerCommands((await import("../command_list.js")).commandList);
  } else if (subcommand === "reload") {
    await interaction.reply({ content: "Authorization success. Queuing reload.", ephemeral: true });
    (await import("../../../bot.js")).broadcastReload();
  }
};

export const handlers = {
  command: pleaseCommand,
  chatInput: chatInputHandler,
};
