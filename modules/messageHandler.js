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
import { getTag } from "./countdownHelper.js";
import { runTime } from "../index.js";
import config from "../config.json";

const { prefix, botOwner, maxCountdowns } = config;

const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const inlineCommandPattern = new RegExp(
  `^(.*)${escapedPrefix}(${escapedPrefix}[^${escapedPrefix}]+)${escapedPrefix}(.*)$`,
  "sm"
);

const maxTimeEnd = new Date();
maxTimeEnd.setFullYear(maxTimeEnd.getFullYear() + 2);

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
  if (!inline && !message.content.startsWith(prefix)) {
    // If DM, guide them to !help
    if (message.channel instanceof DMChannel)
      return await sendReply("Try `!help`\nInvite from https://top.gg/bot/710486805836988507");
    return;
  }

  const content = inline ? inlineContent[2] : message.content;
  const args = content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // Display help message
  if (["help", "commands", "usage"].includes(command))
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? await sendReply(generateHelpFallback())
      : await sendReply(generateHelpEmbed(command));

  // Show process stats
  if (command === "botstats")
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? await sendReply(generateStatsFallback(message.client))
      : await sendReply(await generateStatsEmbed(message.client));

  // Start a countdown
  if (command === "countdown") {
    if (!args.length)
      return await sendReply(
        "Syntax: `!countdown <Date/time to countdown to>`\n" +
          "*Edit your message to see this error go away*"
      );

    let MessageObj = {};

    const tagObj = getTag(args.join(" "), message);

    if (tagObj.error) return await sendReply(tagObj.error);

    const { command: argstring, tag } = tagObj;
    if (tag) MessageObj.tag = tag;

    if (["infinity", "\u221E", "\u267E\uFE0F"].includes(argstring.toLowerCase()))
      return await sendReply("Seriously? -_-");

    const date = chrono.parseDate(argstring);
    if (!date)
      return await sendReply("Invalid date/time!\n*Edit your message to see this error go away*");

    if (!message.guild?.available)
      return await sendReply("The date/time is valid, but this bot can only be used in servers.");

    let priority = true;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      const countdowns = await getCountdownLen(message.guild.id);
      if (countdowns >= maxCountdowns)
        return await sendReply(
          "Max countdowns exceeded. You must have the `MANAGE_MESSAGES` permission to set any more."
        );
      priority = false;
    }

    const timeEnd = new Date(date);
    const timeLeft = timeEnd - Date.now();
    if (timeLeft < 10000)
      return await sendReply(
        "You are trying to set a countdown to a date/time in the past. " +
          "A common reason for this is the lack of year.\n" +
          "*Edit your message to see this error go away*"
      );

    if (timeEnd > maxTimeEnd)
      return await sendReply(
        ":eyes: That's too far away in the future. Currently, countdowns are limited to 2 years."
      );

    let reply = `Time left: ${timeDiffForHumans(timeLeft)} left.`;
    if (inline) {
      MessageObj.content = [inlineContent[1], inlineContent[3]];
      reply = `${inlineContent[1]}${timeDiffForHumans(timeLeft)}${inlineContent[3]}`;
    }

    message[Symbol.for("active")] = true;
    return await sendReply(reply).then(replyMessage => {
      if (!replyMessage?.id || !replyMessage.guild?.id || !replyMessage.channel?.id) return;

      // Delete message initiating countdowm if possible
      if (message.deletable) message.delete({ reason: "Countdown initiate" });

      MessageObj = {
        messageId: replyMessage.id,
        channelId: replyMessage.channel.id,
        timeEnd: timeEnd,
        ...MessageObj,
      };
      addCountdown(replyMessage.guild.id, MessageObj, priority);
    });
  }

  if (command === "whoistherealtechguy") return await sendReply("<@553965304993153049>");

  if (message.author?.id === botOwner) {
    if (command === "flush" && args.length === 1)
      return await sendReply(await removeCountdowns(args[0]));

    if (command === "logs")
      return await getLogs().then(results =>
        sendReply(runTime.join(" | ") + "\n```" + results.join("\n") + "```")
      );

    if (command === "eval") {
      try {
        return await sendReply(`${eval(args.join(""))}`);
      } catch (ex) {
        return await sendReply(`Error: ${ex}`);
      }
    }

    if (command === "kill") exit();
  }
};
