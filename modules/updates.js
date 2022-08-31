import { userMention } from "discord.js";
import { getNextCountDown } from "./sqlite3.js";

export const performUpdates = async client => {
  const result = getNextCountDown(client.runId);
  if (!result) return;
  const { guild: guildId, channel: channelId, author: authorId, data: dataStr } = result;
  const data = JSON.parse(dataStr);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = await guild.channels.fetch(channelId).catch(() => {});
  if (!channel) return;

  if (data.type === "timer") {
    const { replyTo, reason } = data;
    let start = reason ? `**${reason}** *Timer complete!*` : "*Timer complete!*";
    channel.send({
      content: `${start} ${userMention(authorId)}`,
      reply: {
        messageReference: replyTo,
        failIfNotExists: false,
      },
    });
  }
};
