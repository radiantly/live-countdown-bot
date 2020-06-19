import { DMChannel, MessageEmbed } from "discord.js";
import chrono from "chrono-node";
import { exit } from "process";
import { timeDiffForHumans } from "./timeDiffForHumans.js";
import {
  generateHelpEmbed,
  generateHelpFallback,
  generateStatsEmbed,
  generateStatsFallback,
} from "./embed.js";
import {
  getCountdownLen,
  addCountdown,
  log,
  removeCountdowns,
  removeMessageWithId,
  getLogs,
} from "./db.js";
import config from "../config.json";

const { prefix, botOwner, maxCountdowns } = config;

const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const inlineCommandPattern = new RegExp(
  `^(.*)${escapedPrefix}(${escapedPrefix}[^${escapedPrefix}]+)${escapedPrefix}(.*)$`,
  "sm"
);

// messageReply is only populated during a messageUpdate event
export const messageHandler = async (message, messageReply) => {
  // Check if partial message or if author is a bot
  if (message.partial || message.author.bot) return;

  // Check if we're allowed to send messages in the channel
  if (message.guild?.me?.permissionsIn(message.channel.id).has("SEND_MESSAGES") === false) return;

  const sendReply = async reply => {
    if (messageReply) {
      if (reply instanceof MessageEmbed)
        return await messageReply.edit({ content: null, embed: reply });
      return await messageReply.edit({ content: reply, embed: null });
    }
    const sentMessage = await message.channel.send(reply);
    message[Symbol.for("messageReply")] = sentMessage;
    return sentMessage;
  };

  // If active countdown exists for the current message, only process message once it is removed
  if (message[Symbol.for("active")])
    if (messageReply && (await removeMessageWithId(message.guild.id, messageReply.id)))
      message[Symbol.for("active")] = false;
    else return sendReply("Error. Message in superposition.");

  const inlineContent = message.content.match(inlineCommandPattern);
  const inline = inlineContent?.length === 4;

  // Check if inline command or starts with prefix
  if (!inline && !message.content.startsWith(prefix))
    // If DM, guide them to !help
    return (
      message.channel instanceof DMChannel &&
      sendReply("Try `!help`\nInvite from https://top.gg/bot/710486805836988507")
    );

  const content = inline ? inlineContent[2] : message.content;
  const args = content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // Display help message
  if (["help", "commands", "usage"].includes(command))
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? sendReply(generateHelpFallback())
      : sendReply(generateHelpEmbed(command));

  // Show process stats
  if (command === "botstats")
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? sendReply(generateStatsFallback(message.client))
      : sendReply(await generateStatsEmbed(message.client));

  // Start a countdown
  if (command === "countdown") {
    if (!args.length)
      return sendReply(
        "Syntax: `!countdown <Date/time to countdown to>`\n" +
          "*Edit your message to see this error go away*"
      );

    let MessageObj = {};
    if (args[0].startsWith("tag")) {
      const subcommand = args.shift().toLowerCase().replace(/-/g, "");
      // prettier-ignore
      MessageObj.tag = subcommand === "tageveryone" ? "@everyone" :
                       subcommand === "taghere" ? "@here" :
                       subcommand === "tagme" ? `<@${message.author.id}>` : "";
      if (!MessageObj.tag) return sendReply("Accepted tags: tagme/taghere/tageveryone");
    }
    const argstring = args.join(" ");

    if (["infinity", "\u221E", "\u267E\uFE0F"].includes(argstring.toLowerCase()))
      return sendReply("Seriously? -_-");

    const date = chrono.parseDate(argstring);
    if (!date)
      return sendReply("Invalid date/time!\n*Edit your message to see this error go away*");

    if (!message.guild?.available)
      return sendReply("The date/time is valid, but this bot can only be used in servers.");

    let priority = true;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      const countdowns = await getCountdownLen(message.guild.id);
      if (countdowns >= maxCountdowns)
        return sendReply(
          "Max countdowns exceeded. You must have the `MANAGE_MESSAGES` permission to set any more."
        );
      priority = false;
    }

    const timeEnd = new Date(date);
    const timeLeft = timeEnd - Date.now();
    if (timeLeft < 10000)
      return sendReply(
        "You are trying to set a countdown to a date/time in the past. " +
          "A common reason for this is the lack of year.\n" +
          "*Edit your message to see this error go away*"
      );

    let reply = `Time left: ${timeDiffForHumans(timeLeft)} left.`;
    if (inline) {
      MessageObj.content = [inlineContent[1], inlineContent[3]];
      reply = `${inlineContent[1]}${timeDiffForHumans(timeLeft)}${inlineContent[3]}`;
    }

    message[Symbol.for("active")] = true;
    return sendReply(reply).then(replyMessage => {
      if (!replyMessage?.id || !replyMessage.guild?.id || !replyMessage.channel?.id) return;

      // Delete message initiating countdown if the bot has MANAGE_MESSAGES permission
      if (message.guild.me?.permissionsIn(message.channel.id).has("MANAGE_MESSAGES"))
        message.delete({ reason: "Countdown initiate" });

      MessageObj = {
        messageId: replyMessage.id,
        channelId: replyMessage.channel.id,
        timeEnd: timeEnd,
        ...MessageObj,
      };
      addCountdown(replyMessage.guild.id, MessageObj, priority);
    });
  }

  if (command === "whoistherealtechguy") return sendReply("<@553965304993153049>");

  if (message.author?.id === botOwner) {
    if (command === "flush" && args.length === 1) sendReply(await removeCountdowns(args[0]));

    if (command === "logs")
      getLogs()
        .then(results => sendReply("```" + results.join("\n") + "```"))
        .catch(err => log(err));

    if (command === "kill") exit();
  }
};
