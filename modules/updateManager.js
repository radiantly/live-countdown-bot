import { Message, DiscordAPIError } from "discord.js";
import { getNextInQueue, removeMessageWithReplyId, updateRecomputedCountdown } from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";
import { assembleInlineMessage } from "./countdownHelper.js";

// Automatically reject promise after 1000ms
const timedPromise = (callback, ...args) => {
  return Promise.race([
    callback(...args),
    new Promise((_, reject) =>
      setTimeout(reject, 1000, new Error(`Promise timed out: ${callback.name}(${args.join(" ,")})`))
    ),
  ]);
};

export const updateCountdowns = async (client, clientId) => {
  client.setTimeout(updateCountdowns, 200, client, clientId);
  const countdownObj = getNextInQueue(clientId);

  // Abort if no elements exist
  if (!countdownObj) return;

  const {
    Channel: channelId,
    ReplyMessage: replyMsgId,
    NextUpdate: thisUpdate,
    CountObj: countObj,
  } = countdownObj;

  // Abort if thisUpdate is supposed to be too far away
  if (Math.round(thisUpdate) > Date.now()) return;

  const { parts, timers } = JSON.parse(countObj);

  // Get channel. Remove countdown if not viewable.
  const channel = client.channels.cache.get(channelId);
  if (!channel?.viewable) return removeMessageWithReplyId(replyMsgId);

  let messageToEdit = channel.messages.cache.get(replyMsgId);
  if (!messageToEdit) messageToEdit = new Message(client, { id: replyMsgId }, channel);
  const editMessage = messageToEdit.edit.bind(messageToEdit);
  const sendMessage = channel.send.bind(channel);

  // Check if inline message
  if (parts) {
    const { assembledMessage, nextUpdate, priority } = assembleInlineMessage(timers, parts);
    if (!nextUpdate) removeMessageWithReplyId(replyMsgId);
    else
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate,
        priority,
      });
    await timedPromise(editMessage, assembledMessage);
  } else {
    // If not inline, it must be a normal message

    const timeEnd = new Date(timers[0].timeEnd);
    const timeLeft = timeEnd - Date.now();

    let editText;

    // If countdown is done
    if (timeLeft < 10000) {
      removeMessageWithReplyId(replyMsgId);
      editText = "Countdown done.";

      // If tag exists, send a new message with the tag.
      if (timers[0].tag)
        if (channel.permissionsFor(client.user).has("SEND_MESSAGES"))
          await timedPromise(sendMessage, `Countdown done! ${timers[0].tag}`).catch(err =>
            console.error(err)
          );
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft);
      editText = `Time left: ${humanDiff} left.`;
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate: timeEnd - timeLeftForNextUpdate,
        priority: timeLeftForNextUpdate ? 0 : 10,
      });
    }
    try {
      await timedPromise(editMessage, editText);
    } catch (error) {
      console.log(replyMsgId, error);
      if (error instanceof DiscordAPIError) removeMessageWithReplyId(replyMsgId);
    }
  }
};
