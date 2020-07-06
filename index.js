import { Client, Intents, Message, DiscordAPIError } from "discord.js";
import process, { env } from "process";
import config from "./config.json";
import { timeDiffForHumans } from "./modules/timeDiffForHumans.js";
import {
  redis,
  removeCountdowns,
  getMessages,
  removeMessage,
  removeMessageWithId,
  trimMessages,
  log,
} from "./modules/db.js";
import { messageHandler } from "./modules/messageHandler.js";
import { postServerCount } from "./modules/post.js";

const activities = [
  { name: "https://bit.ly/live-bot", type: "WATCHING" },
  { name: "for !help", type: "WATCHING" },
  { name: "the time fly by", type: "WATCHING" },
  { name: "the clock tick", type: "LISTENING" },
  { name: "with time", type: "PLAYING" },
];
const activity = activities[Math.floor(Math.random() * activities.length)];
const presence =
  env.NODE_ENV === "debug"
    ? { activity: { name: "maintenance", type: "WATCHING" }, status: "dnd" }
    : { activity, status: "online" };

const requiredIntents = new Intents(["DIRECT_MESSAGES", "GUILDS", "GUILD_MESSAGES"]);

const client = new Client({
  messageCacheMaxSize: 10,
  presence,
  ws: { intents: requiredIntents },
});

const { token, maxCountdowns, botOwner } = config;

client.once("ready", () => {
  log("Bot initialized.");
  periodicUpdate();

  // Post server counts to bot lists hourly.
  if (env.NODE_ENV === "production") client.setInterval(postServerCount, 60 * 60 * 1000, client);
});

client.on("message", async message => {
  await messageHandler(message);
  if (message.author?.id !== client.user?.id && !message[Symbol.for("messageReply")])
    message.channel.messages.cache.delete(message.id);
});

client.on("messageUpdate", (oldMessage, message) => {
  if (message.partial || message.author.bot) return;

  const messageReply = message[Symbol.for("messageReply")];
  if (messageReply && !messageReply.deleted) messageHandler(message, messageReply);
});

client.on("messageDelete", message => {
  const { id: messageId, guild, client, author } = message;
  if (author?.id !== client.user?.id || !guild?.available) return;

  removeMessageWithId(guild.id, messageId);
});

client.on("guildCreate", guild => {
  if (guild.systemChannel && guild.me?.permissionsIn(guild.systemChannel.id).has("SEND_MESSAGES"))
    guild.systemChannel.send(
      "**Glad to be a part of your server** :heart:\nYou're probably looking for `!help`"
    );
  log(`Added to ${guild.name} (${guild.id})`);
});

client.on("guildDelete", async guild => {
  log(`Removed from ${guild.name}: ${await removeCountdowns(guild.id)}`);
});

client.on("rateLimit", rateLimitInfo => {
  log(rateLimitInfo);
});

let index = 0;
let runStart = 0;
export const runTime = new Array(maxCountdowns);
const periodicUpdate = async () => {
  runStart = Date.now();
  if (index >= maxCountdowns) {
    await trimMessages(index);
    index = 0;
  } else {
    for await (const { server: serverId, MessageString } of getMessages(index)) {
      try {
        const MessageObj = JSON.parse(MessageString);
        const { messageId, channelId, timeEnd } = MessageObj;

        const channel = client.channels.cache.get(channelId);
        if (!channel?.viewable) return removeMessage(serverId, MessageString);

        let messageToEdit = channel.messages.cache.get(messageId);
        if (!messageToEdit) messageToEdit = new Message(client, { id: messageId }, channel);

        const timeLeft = Date.parse(timeEnd) - Date.now();

        if (timeLeft <= 0) {
          let finalText = MessageObj.hasOwnProperty("content")
            ? `${MessageObj.content[0]}no minutes${MessageObj.content[1]}`
            : "Countdown done.";
          if (MessageObj.tag) finalText += ` ${MessageObj.tag}`;
          await messageToEdit.edit(finalText);
          removeMessage(serverId, MessageString);
          continue;
        }
        const editedText = MessageObj.hasOwnProperty("content")
          ? `${MessageObj.content[0]}${timeDiffForHumans(timeLeft)}${MessageObj.content[1]}`
          : `Time left: ${timeDiffForHumans(timeLeft)} left.`;
        await messageToEdit.edit(editedText);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        log(error);
        if (error instanceof DiscordAPIError) removeMessage(serverId, MessageString);
      }
    }
    runTime[index] = Date.now() - runStart;
    index += 1;
  }
  client.setTimeout(periodicUpdate, Math.max(5000 - (Date.now() - runStart), 0));
};

setInterval(() => {
  if (runStart && runStart + 7 * 60 * 1000 < Date.now()) {
    log(`Had to restart countdown ${Date.now() - runStart}`);
    client.users
      .fetch(botOwner)
      .then(user => user.createDM())
      .then(DMChannel => DMChannel.send("Had to restart. Check logs."))
      .then(message => quitGracefully())
      .catch(err => log(err));
  }
}, 10 * 60 * 1000);

if (env.NODE_ENV === "debug") client.on("debug", console.info);
process.on("unhandledRejection", log);

// Only bother starting client if redis starts up
redis.once("ready", () => client.login(token));

// Quit gracefully
const quitGracefully = async () => {
  setImmediate(() => process.exit());
  await log("Destroying client.");
  client.destroy();
  redis.quit();
};

process.on("SIGTERM", quitGracefully);
process.on("SIGINT", quitGracefully);
process.on("SIGHUP", quitGracefully);
