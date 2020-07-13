import { Message } from "discord.js";
import { getNextInQueue, removeMessageWithReplyId, updateRecomputedCountdown } from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";

export const updateCountdowns = (client, clientId) => {
  const countdownObj = getNextInQueue(clientId);
  console.log(countdownObj);
  if (!countdownObj) return setTimeout(updateCountdowns, 10000, client, clientId);
  const { Channel: channelId, ReplyMessage: replyMsgId, CountObj: countObj } = countdownObj;
  const { parts, timers } = JSON.parse(countObj);

  const channel = client.channels.cache.get(channelId);
  if (!channel?.viewable) removeMessageWithReplyId(replyMsgId);

  let messageToEdit = channel.messages.cache.get(replyMsgId);
  if (!messageToEdit) messageToEdit = new Message(client, { id: replyMsgId }, channel);

  // Check if inline message
  if (parts) {
    const { assembledMessage, priority, nextUpdate } = assembleInlineMessage(timers, parts);
    updateRecomputedCountdown({
      replyMsgId,
      nextUpdate,
      priority,
    });
    messageToEdit.edit(assembledMessage);
  } else {
    // If not inline, it must be a normal message
    const timeEnd = new Date(timers[0].timeEnd);
    const timeLeft = timeEnd - Date.now();
    let editText;
    if (timeLeft < 5000) {
      editText = "Countdown done.";
      if (timers[0].tag) editText += timers[0].tag;
      removeMessageWithReplyId(replyMsgId);
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft);
      editText = `Time left: ${humanDiff} left.`;
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate: timeEnd - timeLeftForNextUpdate,
        priority: timeLeftForNextUpdate ? 0 : 10,
      });
    }
    messageToEdit.edit(editText);
  }
  setTimeout(updateCountdowns, 10000, client, clientId);
};
