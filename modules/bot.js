import { Client, Intents } from "discord.js";
import process, { env } from "process";
import config from "../config.js";
import { db, initGuilds, addGuild, removeMessageWithReplyId, removeGuild } from "./sqlite3.js";
import { messageHandler } from "./messageHandler.js";
import { postServerCount } from "./post.js";
import { updateCountdowns } from "./updateManager.js";

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
  messageCacheLifetime: 30 * 60 * 60,
  messageSweepInterval: 6 * 60 * 60,
  presence,
  ws: { intents: requiredIntents },
});

export const clientId = Math.round(Math.random() * 1e9);

const { token } = config;
const log = console.log;
client.once("ready", () => {
  log(`Initialized client ${clientId} (${client.shard.ids.join()}).`);

  initGuilds(client.guilds.cache, clientId);
  updateCountdowns(client, clientId);
});

client.on("message", async message => {
  await messageHandler(message);
  if (message.author?.id !== client.user?.id && !message[Symbol.for("messageReply")])
    message.channel.messages.cache.delete(message.id);
});

client.on("messageUpdate", (_, message) => {
  if (message.partial || message.author.bot) return;

  const messageReply = message[Symbol.for("messageReply")];
  if (messageReply && !messageReply.deleted) messageHandler(message, messageReply);
});

client.on("messageDelete", message => {
  const { guild, client, author } = message;
  if (message.partial || author.id !== client.user.id || !guild.available) return;

  removeMessageWithReplyId(message.id);
});

client.on("guildCreate", guild => {
  addGuild(guild.id, clientId);
  if (guild.systemChannel && guild.me?.permissionsIn(guild.systemChannel.id).has("SEND_MESSAGES"))
    guild.systemChannel.send(
      "**Glad to be a part of your server** :heart:\nYou're probably looking for `!help`"
    );
  log(`Added to ${guild.name} (${guild.id})`);
});

client.on("guildDelete", guild => {
  log(`Removed from ${guild.name} (${guild.id})`);
  removeGuild(guild.id);
});

client.on("rateLimit", rateLimitInfo => {
  log(rateLimitInfo);
});

// Start client
client.login(token);
if (env.NODE_ENV === "debug") client.on("debug", console.info);

process.on("unhandledRejection", log);
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
process.on("exit", code => {
  console.log(`Destroying client ${clientId} (${client.shard.ids.join()}). Code ${code}.`);
  client.destroy();
  db.close();
});
