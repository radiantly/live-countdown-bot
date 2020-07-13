import { getNextInQueue, removeMessageWithReplyId, updateRecomputedCountdown } from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";

export const updateCountdowns = (client, clientId) => {
  const countdownObj = getNextInQueue(clientId);
  console.log(countdownObj);
  if (!countdownObj) setTimeout(updateCountdowns, 10000, client, clientId);
  const { Channel, ReplyMessage, CountObj } = countdownObj;
  const { parts, timers } = JSON.parse(CountObj);

  const channel = client.channels.cache.get(Channel);
  if (!channel?.viewable) removeMessageWithReplyId(ReplyMessage);

  let messageToEdit = channel.messages.cache.get(messageId);
  if (!messageToEdit) messageToEdit = new Message(client, { id: messageId }, channel);

  if (parts) {
    let nextUpdate = timers[0].timeEnd;
    let priority = 0;

    const assembled = timers.map((timer, index) => {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timer.timeEnd - Date.now());
      if (!timeLeftForNextUpdate) priority = 10;
      console.log(timer, timeLeftForNextUpdate);
      const timerNextUpdate = timer.timeEnd - timeLeftForNextUpdate;
      nextUpdate = Math.min(nextUpdate, timerNextUpdate);
      return inline.parts[index] + humanDiff;
    });
    assembled.push(inline.parts[inline.parts.length - 1]);
  } else {
    const timeEnd = new Date(timers[0].timeEnd);
    const timeLeft = timeEnd - Date.now();
    let editText;
    if (timeLeft < 1000) {
      editText = "Countdown done.";
      if (timers[0].tag) editText += timers[0].tag;
      // Remove message
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft);
      editText = `Time left: ${humanDiff} left.`;
      updateRecomputedCountdown({
        ReplyMessage,
        NextUpdate: timeEnd - timeLeftForNextUpdate,
        Priority: timeLeftForNextUpdate ? 0 : 10,
      });
    }
    messageToEdit.edit(editText);
  }
  saveRecomputed();
  setImmediate(updateCountdowns, client);
};
