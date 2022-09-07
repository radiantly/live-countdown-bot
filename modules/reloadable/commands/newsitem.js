import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { isOwner } from "../helpers.js";
import { kv } from "../sqlite3.js";

export const newsitemCommand = new SlashCommandBuilder()
  .setName("newsitem")
  .setDescription("News related commands")
  .addSubcommand(subcommand =>
    subcommand
      .setName("add")
      .setDescription("Add a news item to the list")
      .addStringOption(option =>
        option
          .setName("text")
          .setDescription("What would you like to tell the users of the bot?")
          .setRequired(true)
      )
  )
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  if (!isOwner(interaction.user.id)) {
    console.error(`Unauthorized newsitem add by user ${interaction.user.id}`);
    return interaction.reply({
      content:
        "I'm not sure how you got access to this command .. but you need to be the owner to use it.",
      ephemeral: true,
    });
  }

  const text = interaction.options.getString("text", true);

  const news = kv.news ? JSON.parse(kv.news) : [];
  news.push({ time: Date.now(), text });

  kv.news = JSON.stringify(news);

  interaction.reply({
    content: "News item added.",
    ephemeral: true,
  });
};

export const handlers = {
  command: newsitemCommand,
  chatInput: chatInputHandler,
};
