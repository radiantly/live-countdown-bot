import { MessageEmbed, Permissions } from "discord.js";
import { exit } from "process";
import { inspect, types } from "util";
import { computeTimeDiff } from "./computeTimeDiff.js";
import {
  generateHelpEmbed,
  generateHelpFallback,
  generateStatsEmbed,
  generateStatsFallback,
} from "./embed.js";
import { addCountdown } from "./sqlite3.js";
import { parseInline, computeCountdown, assembleInlineMessage } from "./countdownHelper.js";
import config from "../config.js";
import { getPrefix, setPrefix, escapeBacktick } from "./prefixHandler.js";
import { t } from "./lang.js";
import { faq } from "./faq.js";

const { botOwner } = config;
const {
  FLAGS: { SEND_MESSAGES, EMBED_LINKS, MANAGE_MESSAGES },
} = Permissions;

export const messageHandler = async message => {
  // Check if author is a bot
  if (message.author.bot) return;

  // DMChannels are uncached
  if (message.channel.partial) await message.channel.fetch();

  // Send a message
  // mainContent can either be a string or embed.
  // If we do not have embed permissions, then contentFallback is sent.
  const send = async (mainContent, contentFallback) => {
    // Check if we can send messages
    if (message.guild?.me?.permissionsIn(message.channel.id).has(SEND_MESSAGES) === false)
      return null;
    if (typeof mainContent === "string") return await message.channel.send(mainContent);
    if (mainContent instanceof MessageEmbed)
      return message.guild?.me?.permissionsIn(message.channel.id).has(EMBED_LINKS) === false
        ? await message.channel.send(contentFallback)
        : await message.channel.send({ embeds: [mainContent] });

    // Main content must me MessageOptions object
    return message.channel.send(mainContent);
  };

  const deleteMessage = message =>
    message.deletable && message.delete({ reason: "Automatic countdown deletion!" });

  // Check if inline countdown
  const inline = parseInline(message.content);

  if (inline) {
    if (!message.guild?.available)
      return await send("Sorry, countdowns can only be initiated in servers.");
    let error = false;
    const timers = inline.commands.map(inlineCommand => {
      const timer = computeCountdown(inlineCommand, message);
      if (timer.error) error = true;
      return timer;
    });
    if (error)
      return await send(
        timers
          .map((timer, index) =>
            timer.error
              ? `:negative_squared_cross_mark: Countdown ${index + 1}: ${timer.error}`
              : `:white_check_mark: Countdown ${index + 1}: No problems`
          )
          .join("\n")
      );

    const { assembledMessage, priority, nextUpdate } = assembleInlineMessage(timers, inline.parts);

    const replyMessage = await send(assembledMessage);
    deleteMessage(message);
    if (replyMessage)
      addCountdown({
        guildId: message.guildId,
        channelId: message.channelId,
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
    return await send(`Need help? Try ${escapeBacktick(prefix + "help")}`);

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "cdfaq") {
      if (!args.length)
        return await send(
          new MessageEmbed().setTitle("Live Countdown Bot FAQ").setDescription(
            `Syntax: \`${prefix}cdfaq TAG\`\n\nAvailable tags: ${Object.keys(faq)
              .map(k => `\`${k}\` `)
              .join("")}`
          )
        );

      if (!(args[0] in faq)) return;

      const qas = Array.isArray(faq[args[0]]) ? faq[args[0]] : [faq[args[0]]];
      const embed = new MessageEmbed().addFields(...qas.map(qa => ({ name: qa.q, value: qa.a })));
      const contributedBy = qas
        .filter(qa => qa.by)
        .map(qa => qa.by)
        .join(", ");
      if (contributedBy) embed.setFooter(`Contributed by ${contributedBy}`);

      return await send(embed);
    }

    if (command === "countdown") {
      if (!message.guild?.available)
        return await send("Sorry, countdowns can only be initiated in servers.");
      let countdownCommand = args.join(" ");

      let sendChannel = message.channel;
      const sendChannelId = /<#(\d+)>/.exec(countdownCommand);
      if (sendChannelId?.length >= 2) {
        countdownCommand = countdownCommand.replace(/<#(\d+)>/g, "");
        sendChannel = message.guild.channels.cache.get(sendChannelId[1]);
        if (!sendChannel || !sendChannel.viewable)
          return await send("I can't seem to find that channel :thinking:");
        if (!sendChannel.permissionsFor(message.guild.me).has(SEND_MESSAGES))
          return await send(
            "Hmmm. It looks like I don't have the send messages permission in that channel."
          );
        if (!sendChannel.permissionsFor(message.author).has(SEND_MESSAGES))
          return await send(
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
        if (timeLeft > 2000) send(`${t("countingDown", lang)} ..`);
        return setTimeout(
          () =>
            send({
              content: `${t("countdownDone", lang)}! ${tag || ""}`,
              failIfNotExists: false,
            }),
          timeLeft
        );
      }

      if (timer.error) return await send(timer.error);
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(
        timer.timeEnd - Date.now(),
        Date.now() - timer.timeStart,
        timer.lang
      );
      const replyMessage = await sendChannel.send(`${t("timeLeft", timer.lang)}: ${humanDiff}.`);
      deleteMessage(message);
      if (replyMessage)
        addCountdown({
          guildId: replyMessage.guildId,
          channelId: replyMessage.channelId,
          origMsgId: message.id,
          replyMsgId: replyMessage.id,
          nextUpdate: timer.timeEnd - timeLeftForNextUpdate,
          priority: timeLeftForNextUpdate ? 0 : 10,
          countObj: JSON.stringify({ timers: [timer] }),
        });
    }

    // Set a new prefix
    if (command === "setprefix") {
      if (args.length !== 1) return await send(`Syntax: \`${prefix}setprefix NEW_PREFIX\``);
      const newPrefix = args[0];
      if (newPrefix.length >= 4) return await send("Prefix can at most be 3 characters.");
      if (!message.guild?.available)
        return await send("Sorry, custom prefixes can only be set in servers.");
      if (!message.member.permissionsIn(message.channel).has(MANAGE_MESSAGES))
        return await send(
          "Sorry, you must have the `MANAGE_MESSAGES` permission to set a new prefix."
        );
      setPrefix(message.guild, newPrefix);
      return await send(
        `Prefix has been successfully set to ${escapeBacktick(newPrefix)}\n` +
          "*Note: Inline countdowns still use `!`*"
      );
    }

    // Display help message
    if (["help", "usage"].includes(command) && !args.length)
      return await send(generateHelpEmbed(prefix), generateHelpFallback(prefix));

    // Show process stats
    if (command === "botstats")
      return await send(
        await generateStatsEmbed(message.client),
        generateStatsFallback(message.client)
      );

    if (command === "whoistherealtechguy") return await send("<@553965304993153049>");

    if ([botOwner, "360084558265450496"].includes(message.author.id)) {
      if (command.startsWith("eval")) {
        let result;
        try {
          result = eval(args.join(" "));
          if (types.isPromise) result = await result;
        } catch (ex) {
          result = ex;
        }
        if (typeof result !== "string") result = inspect(result);
        return command === "eval" ? await send("```\n" + result.substr(0, 1950) + "\n```") : null;
      }

      if (command === "kill") exit();
    }
  }
  // If DM channel and not command, guide them to help.
  if (message.channel.type === "DM")
    return await send("Try `!help`\nInvite from https://top.gg/bot/710486805836988507");
};
