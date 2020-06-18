import { DMChannel } from "discord.js";
import chrono from "chrono-node";
import { exit } from "process";
import { timeDiffForHumans } from "./timeDiffForHumans.js";
import { react } from "./reactionHelper.js";
import {
  generateHelpEmbed,
  generateHelpFallback,
  generateStatsEmbed,
  sendStatsFallback,
} from "./embed.js";
import { getCountdownLen, addCountdown, log, removeCountdowns, getLogs } from "./db.js";
import config from "../config.json";

const { prefix, botOwner, maxCountdowns } = config;

const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const inlineCommandPattern = new RegExp(
  `^(.*)${escapedPrefix}(${escapedPrefix}[^${escapedPrefix}]+)${escapedPrefix}(.*)$`,
  "sm"
);

export const messageHandler = async message => {
  // Check if partial message or if author is a bot
  if (message.partial || message.author.bot) return;

  // Check if we're allowed to send messages in the channel
  if (message.guild?.me?.permissionsIn(message.channel.id).has("SEND_MESSAGES") === false) return;

  const inlineContent = message.content.match(inlineCommandPattern);
  const inline = inlineContent?.length === 4;

  // Check if inline command or starts with prefix
  if (!inline && !message.content.startsWith(prefix))
    // If DM, guide them to !help
    return (
      message.channel instanceof DMChannel &&
      message.channel.send("Try `!help`\nInvite from https://top.gg/bot/710486805836988507")
    );

  const content = inline ? inlineContent[2] : message.content;
  const args = content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // Display help message
  if (["help", "commands", "usage"].includes(command))
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? message.channel.send(generateHelpFallback())
      : message.channel.send(generateHelpEmbed(command));

  // Show process stats
  if (command === "botstats")
    return message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false
      ? sendStatsFallback(message)
      : message.channel.send(await generateStatsEmbed(message.client));

  // Start a countdown
  if (command === "countdown") {
    if (!args.length) return react(message);

    let MessageObj = {};
    if (args[0].startsWith("tag")) {
      const subcommand = args.shift().toLowerCase().replace(/-/g, "");
      // prettier-ignore
      MessageObj.tag = subcommand === "tageveryone" ? "@everyone" :
                       subcommand === "taghere" ? "@here" :
                       subcommand === "tagme" ? `<@${message.author.id}>` : "";
      if (!MessageObj.tag) return react(message);
    }
    const argstring = args.join(" ");

    if (argstring === "\u221E" || argstring === "\u267E\uFE0F") return react(message, 42);

    const date = chrono.parseDate(argstring);
    if (date)
      if (message.guild?.available) {
        let priority = true;
        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
          const countdowns = await getCountdownLen(message.guild.id);
          if (countdowns >= maxCountdowns)
            return message.reply(
              "Max countdowns exceeded. You must have the `SEND_MESSAGES` permission to set any more."
            );
          priority = false;
        }

        const timeEnd = new Date(date);
        const timeLeft = timeEnd - Date.now();
        if (timeLeft < 10000)
          return message.reply(
            "You are trying to set a countdown to a date/time in the past. " +
              "A common reason for this is the lack of year."
          );

        let reply = `Time left: ${timeDiffForHumans(timeLeft)} left.`;
        if (inline) {
          MessageObj.content = [inlineContent[1], inlineContent[3]];
          reply = `${inlineContent[1]}${timeDiffForHumans(timeLeft)}${inlineContent[3]}`;
        }
        return message.channel.send(reply).then(replyMessage => {
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
      } else {
        return message.channel.send(
          "The date/time is valid, but this bot can only be used in servers."
        );
      }
    else return react(message, "invalidTime");
  }

  if (command === "whoistherealtechguy") return message.channel.send("<@553965304993153049>");

  if (message.author?.id === botOwner) {
    if (command === "flush" && args.length === 1)
      message.channel.send(await removeCountdowns(args[0]));

    if (command === "logs")
      getLogs()
        .then(results => message.channel.send("```" + results.join("\n") + "```"))
        .catch(err => log(err));

    if (command === "kill") exit();
  }
};
