import { Client, Intents, Guild, TextChannel, Message, DiscordAPIError } from "discord.js";
import process from "process";
import config from "./config.json";
import { timeDiffForHumans } from "./modules/timeDiffForHumans.js";
import {
  redis,
  removeCountdowns,
  getMessages,
  removeMessage,
  trimMessages,
  log,
} from "./modules/db.js";
import { messageHandler } from "./modules/messageHandler.js";

const activities = [
  { name: "https://bit.ly/live-bot", type: "WATCHING" },
  { name: "for !help", type: "WATCHING" },
  { name: "the time fly by", type: "WATCHING" },
  { name: "the clock tick", type: "LISTENING" },
  { name: "with time", type: "PLAYING" },
];
const activity = activities[Math.floor(Math.random() * activities.length)];

const requiredIntents = new Intents(["DIRECT_MESSAGES", "GUILDS", "GUILD_MESSAGES"]);

const client = new Client({
  messageCacheMaxSize: 20,
  ws: { intents: requiredIntents },
  presence: { activity: activity },
});

const { token, maxCountdowns } = config;

client.once("ready", () => {
  log("Bot initialized.");
  periodicUpdate();
});

client.on("message", messageHandler);

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

let index = 0;

const periodicUpdate = async () => {
  const timeNow = Date.now();
  if (index >= maxCountdowns) {
    await trimMessages(index);
    index = 0;
  } else {
    for await (const { serverId, MessageString } of getMessages(index)) {
      try {
        const MessageObj = JSON.parse(MessageString);
        const { messageId, channelId, timeEnd } = MessageObj;
        const guild = new Guild(client, { id: serverId });
        const channel = new TextChannel(guild, { id: channelId });
        const messageToEdit = new Message(client, { id: messageId }, channel);

        const timeLeft = Date.parse(timeEnd) - timeNow;

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
      } catch (error) {
        log(error);
        if (error instanceof DiscordAPIError) removeMessage(serverId, MessageString);
      }
    }
    index += 1;
  }
  client.setTimeout(periodicUpdate, Math.max(5000 - (Date.now() - timeNow), 0));
};

process.on("unhandledRejection", reason => log(reason));

// Only bother starting client if redis starts up
redis.once("ready", () => client.login(token));
