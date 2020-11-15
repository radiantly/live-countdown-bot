import { Message, DiscordAPIError } from "./bot.js";
import {
  getNextInQueue,
  removeMessageWithReplyId,
  updateCountObj,
  updateRecomputedCountdown,
} from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";
import { assembleInlineMessage } from "./countdownHelper.js";
import { t } from "./lang.js";

// Automatically reject promise after 1000ms
export const timedPromise = (callback, ...args) => {
  return Promise.race([
    callback(...args),
    new Promise((_, reject) =>
      setTimeout(reject, 5000, new Error(`Promise timed out: ${callback.name}(${args.join(" ,")})`))
    ),
  ]);
};

export const updateCountdowns = async (client, clientId) => {
  client.setTimeout(updateCountdowns, 400, client, clientId);
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
    const { assembledMessage, nextUpdate, priority, finishedTimers } = assembleInlineMessage(
      timers,
      parts
    );
    if (!nextUpdate) removeMessageWithReplyId(replyMsgId);
    else
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate,
        priority,
      });

    // Check if a countdown in the inline countdown is finished
    if (finishedTimers.length) {
      // If it has a tag, tag users.
      const tags = finishedTimers
        .map(timerIndex => timers[timerIndex].tag)
        .filter(Boolean)
        .join(" ");
      if (tags && channel.permissionsFor(client.user).has("SEND_MESSAGES"))
        await timedPromise(sendMessage, `${t("countdownDone")}! ${tags}`).catch(console.error);

      // Remove finished timers backwards
      for (let i = finishedTimers.length - 1; i >= 0; i--) {
        parts.splice(
          finishedTimers[i],
          2,
          parts[finishedTimers[i]] +
            t("inlineNoMinutes", timers[finishedTimers[i]].lang) +
            parts[finishedTimers[i] + 1]
        );
        timers.splice(finishedTimers[i], 1);
      }
      // Update countObj
      updateCountObj({ replyMsgId, countObj: JSON.stringify({ parts, timers }) });
    }

    await timedPromise(editMessage, assembledMessage).catch(error => {
      console.log(replyMsgId, error);
      if (error instanceof DiscordAPIError) removeMessageWithReplyId(replyMsgId);
    });
  } else {
    // If not inline, it must be a normal message

    const timeEnd = new Date(timers[0].timeEnd);
    const timeLeft = timeEnd - Date.now();
    const { lang } = timers[0];

    let editText;

    // If countdown is done
    if (timeLeft < 10000) {
      removeMessageWithReplyId(replyMsgId);
      editText = t("countdownDone", lang);

      // If tag exists, send a new message with the tag.
      if (timers[0].tag)
        if (channel.permissionsFor(client.user).has("SEND_MESSAGES"))
          await timedPromise(
            sendMessage,
            `${t("countdownDone", lang)}! ${timers[0].tag}`
          ).catch(err => console.error(err));
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft, lang);
      editText = `${t("timeLeft", lang)}: ${humanDiff}`;
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate: timeEnd - timeLeftForNextUpdate,
        priority: timeLeftForNextUpdate ? 0 : 10,
      });
    }

    await timedPromise(editMessage, editText).catch(error => {
      console.log(replyMsgId, error);
      if (error instanceof DiscordAPIError) removeMessageWithReplyId(replyMsgId);
    });
  }
};
