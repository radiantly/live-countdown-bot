import { DMChannel, MessageEmbed } from "./bot.js";
import { exit } from "process";
import { inspect, types } from "util";
import { computeChanTimeDiff, computeTimeDiff } from "./computeTimeDiff.js";
import {
  generateHelpEmbed,
  generateHelpFallback,
  generateStatsEmbed,
  generateStatsFallback,
} from "./embed.js";
import { addCountdown, removeChannelCountdowns, removeMessageWithReplyId } from "./sqlite3.js";
import { parseInline, computeCountdown, assembleInlineMessage } from "./countdownHelper.js";
import config from "../config.js";
import { getPrefix, setPrefix, escapeBacktick } from "./prefixHandler.js";
import { t } from "./lang.js";
import { getChan, setChan } from "./chan.js";

const { botOwner } = config;

// messageReply is only populated during a messageUpdate event
export const messageHandler = async (message, messageReply) => {
  // Check if partial message or if author is a bot
  if (message.partial || message.author.bot) return;

  // Check if we're allowed to send messages in the channel
  if (message.guild?.me?.permissionsIn(message.channel.id).has("SEND_MESSAGES") === false) return;

  // Send reply. If message was edited, edit replyMessage.
  const sendReply = async reply => {
    if (messageReply) {
      if (reply instanceof MessageEmbed)
        return await messageReply.edit({ content: null, embed: reply });
      if (typeof reply === "string")
        return await messageReply.edit({ content: reply, embed: null });
      return await messageReply.edit(reply);
    }
    const sentMessage = await message.channel.send(reply);
    // message[Symbol.for("messageReply")] = sentMessage;
    return sentMessage;
  };

  const deleteMessage = message =>
    message.deletable && message.delete({ reason: "Automatic countdown deletion!" });

  if (messageReply) removeMessageWithReplyId(messageReply.id);

  // Check if inline countdown
  const inline = parseInline(message.content);

  if (inline) {
    if (!message.guild?.available)
      return await sendReply("Sorry, countdowns can only be initiated in servers.");
    let error = false;
    const timers = inline.commands.map(inlineCommand => {
      const timer = computeCountdown(inlineCommand, message);
      if (timer.error) error = true;
      return timer;
    });
    if (error)
      return await sendReply(
        timers
          .map((timer, index) =>
            timer.error
              ? `:negative_squared_cross_mark: Countdown ${index + 1}: ${timer.error}`
              : `:white_check_mark: Countdown ${index + 1}: No problems`
          )
          .join("\n")
      );

    const { assembledMessage, priority, nextUpdate } = assembleInlineMessage(timers, inline.parts);

    const replyMessage = await sendReply(assembledMessage);
    deleteMessage(message);
    if (replyMessage)
      addCountdown({
        guildId: message.guild.id,
        channelId: message.channel.id,
        origMsgId: message.id,
        replyMsgId: replyMessage.id,
        nextUpdate,
        priority,
        countObj: JSON.stringify({ parts: inline.parts, timers }),
      });
    return;
  }

  const prefix = message.guild?.available ? getPrefix(message.guild) : "!";

  if (message.content.replace(/^<@!?(\d+)>$/, "$1") === message.client.user.id)
    return await sendReply(`Need help? Try ${escapeBacktick(prefix + "help")}`);

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (
      message.guild?.available &&
      !message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")
    )
      return;

    if (command === "countdown") {
      if (!message.guild?.available)
        return await sendReply("Sorry, countdowns can only be initiated in servers.");
      let countdownCommand = args.join(" ");

      let sendChannel = message.channel;
      const sendChannelId = /<#(\d+)>/.exec(countdownCommand);
      if (sendChannelId?.length >= 2) {
        countdownCommand = countdownCommand.replace(/<#(\d+)>/g, "");
        sendChannel = message.guild.channels.cache.get(sendChannelId[1]);
        if (!sendChannel || !sendChannel.viewable)
          return await sendReply("I can't seem to find that channel :thinking:");
        if (!sendChannel.permissionsFor(message.guild.me).has("SEND_MESSAGES"))
          return await sendReply(
            "Hmmm. It looks like I don't have the send messages permission in that channel."
          );
        if (!sendChannel.permissionsFor(message.author).has("SEND_MESSAGES"))
          return await sendReply(
            "Hmmm. You need to have the send messages permission to initialise a countdown in that channel."
          );
      }
      const timer = computeCountdown(countdownCommand, message);

      // If a timer is less than 1min, we send an "ephemeral" timer
      // This is not stored in the database - instead, we simply use setTimeout
      if (timer.ephemeral) {
        const { timeEnd, lang, tag } = timer.ephemeral;
        const timeLeft = Math.abs(Date.now() - timeEnd);
        deleteMessage(message);
        if (timeLeft > 2000) sendReply(`${t("countingDown", lang)} ..`);
        return setTimeout(sendReply, timeLeft, `${t("countdownDone", lang)}! ${tag || ""}`);
      }

      if (timer.error) return await sendReply(timer.error);
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(
        timer.timeEnd - Date.now(),
        timer.lang
      );
      const replyMessage = await sendChannel.send(`${t("timeLeft", timer.lang)}: ${humanDiff}.`);
      deleteMessage(message);
      if (replyMessage)
        addCountdown({
          guildId: replyMessage.guild.id,
          channelId: replyMessage.channel.id,
          origMsgId: message.id,
          replyMsgId: replyMessage.id,
          nextUpdate: timer.timeEnd - timeLeftForNextUpdate,
          priority: timeLeftForNextUpdate ? 0 : 10,
          countObj: JSON.stringify({ timers: [timer] }),
        });
    }

    if (command === "setchannel") {
      if (!message.guild?.available) return await sendReply("Try again in a server.");
      if (!args.length) return await sendReply(`Syntax: \`${prefix}setchannel CHANNEL_NAME\``);
      const chanName = args.join().replace(" ", "").toLowerCase();
      const chan = message.guild.channels.cache.find(
        c => c.name.replace(" ", "").toLowerCase() === chanName
      );
      if (!chan) return await sendReply(`Channel ${args.join()} not found.`);
      setChan(message.guild, chan.id);
      if (chan.permissionsFor(message.guild.me).has("MANAGE_CHANNELS"))
        return await sendReply(`Channel set to ${chan} successfully.`);
      return await sendReply(
        `Channel ${chan} successfully set, but I do not have the \`MANAGE_CHANNELS\` permission for changing the channel name.`
      );
    }

    if (command === "channelcountdown") {
      if (!message.guild?.available)
        return await sendReply("Sorry, channel countdowns can only be initiated in servers.");

      const channelId = getChan(message.guild);
      if (!channelId)
        return await sendReply(
          `No countdown channel set. Use \`${prefix}setchannel CHANNEL_NAME\` to set one.`
        );

      const chan = message.guild.channels.cache.get(channelId);
      if (!chan) return await sendReply("Cannot find the set channel.");

      let countdownCommand = args.join(" ");

      let sendChannel = message.channel;
      const timer = computeCountdown(countdownCommand, message);

      if (timer.error) return await sendReply(timer.error);
      const { humanDiff, timeLeftForNextUpdate } = computeChanTimeDiff(
        timer.timeEnd - Date.now(),
        timer.lang
      );
      removeChannelCountdowns(message.guild);
      try {
        await chan.setName(humanDiff);
        const replyMessage = await sendChannel.send(`Successfully started channel countdown.`);
        deleteMessage(message);
        if (replyMessage)
          addCountdown({
            guildId: replyMessage.guild.id,
            channelId: replyMessage.channel.id,
            origMsgId: message.id,
            replyMsgId: replyMessage.id,
            nextUpdate: timer.timeEnd - timeLeftForNextUpdate,
            priority: timeLeftForNextUpdate ? 0 : 10,
            countObj: JSON.stringify({ timers: [timer], chan: channelId }),
          });
      } catch (ex) {
        await sendChannel.send(`An error occured - ${ex}`);
      }
    }

    // Set a new prefix
    if (command === "setprefix") {
      if (args.length !== 1) return await sendReply(`Syntax: \`${prefix}setprefix <newprefix>\``);
      const newPrefix = args[0];
      if (newPrefix.length >= 4) return await sendReply("Prefix can at most be 3 characters.");
      if (!message.guild?.available)
        return await sendReply("Sorry, custom prefixes can only be set in servers.");
      if (!message.member.permissionsIn(message.channel).has("MANAGE_MESSAGES"))
        return await sendReply(
          "Sorry, you must have the `MANAGE_MESSAGES` permission to set a new prefix."
        );
      setPrefix(message.guild, newPrefix);
      return await sendReply(`Prefix has been successfully set to ${escapeBacktick(newPrefix)}`);
    }

    const fallbackRequired =
      message.guild?.me?.permissionsIn(message.channel.id).has("EMBED_LINKS") === false;

    // Display help message
    if (["help", "usage"].includes(command) && !args.length)
      return fallbackRequired
        ? await sendReply(generateHelpFallback(prefix))
        : await sendReply(generateHelpEmbed(prefix));

    // Show process stats
    if (command === "botstats")
      return fallbackRequired
        ? await sendReply(generateStatsFallback(message.client))
        : await sendReply(await generateStatsEmbed(message.client));

    if (command === "whoistherealtechguy") return await sendReply("<@553965304993153049>");

    if (message.author.id === botOwner) {
      if (command.startsWith("eval")) {
        let result;
        try {
          result = eval(args.join(" "));
          if (types.isPromise) result = await result;
        } catch (ex) {
          result = ex;
        }
        if (typeof result !== "string") result = inspect(result);
        return command === "eval"
          ? await sendReply("```\n" + result.substr(0, 1950) + "\n```")
          : null;
      }

      if (command === "kill") exit();
    }
  }
  // If DM channel and not command, guide them to help.
  if (message.channel instanceof DMChannel)
    return await sendReply("Try `!help`\nInvite from https://top.gg/bot/710486805836988507");
};
