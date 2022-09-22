import { userMention, bold, italic } from "discord.js";
import { updateQueue } from "../update_queue.js";

export const performUpdates = async client => {
  const result = updateQueue.next();
  if (!result) return;
  const { guild: guildId, channel: channelId, author: authorId, data: dataStr } = result;
  const data = JSON.parse(dataStr);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const { type, replyTo, reason, mention, allowedMentions } = data;
  let start = italic(`${type === "timer" ? "Timer" : "Countdown"} complete!`);
  if (reason) start = `${bold(reason)} ${start}`;

  channel.send({
    content: `${start} ${mention || ""}\nSet by ${userMention(authorId)}`,
    reply: {
      messageReference: replyTo,
      failIfNotExists: false,
    },
    allowedMentions,
  });
};
