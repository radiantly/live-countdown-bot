import { Message, DiscordAPIError, MessageManager } from "discord.js";
import {
  getNextInQueue,
  removeMessageWithReplyId,
  updateCountObj,
  updateRecomputedCountdown,
} from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";
import { assembleInlineMessage } from "./countdownHelper.js";
import { t } from "./lang.js";

// Automatically reject promise after 5000ms
export const timedPromise = (ms = 5000) =>
  new Promise((_, reject) => setTimeout(reject, ms, new Error("Promise timed out")));

export const updateCountdowns = async (client, clientId) => {
  setTimeout(updateCountdowns, 1000, client, clientId);
  const countdownObj = getNextInQueue(clientId);

  // Abort if no elements exist
  if (!countdownObj) return;

  const {
    Channel: channel_id,
    ReplyMessage: replyMsgId,
    NextUpdate: thisUpdate,
    CountObj: countObj,
  } = countdownObj;

  // Abort if thisUpdate is supposed to be too far away
  if (Math.round(thisUpdate) > Date.now()) return;

  const { parts, timers } = JSON.parse(countObj);

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
      if (tags) {
        const channel = await client.channels.fetch(channel_id);
        channel.send(`${t("countdownDone", timers[finishedTimers[0]].lang)}! ${tags}`);
      }

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

    await Promise.race([
      timedPromise(),
      new Message(client, {
        id: replyMsgId,
        channel_id,
      }).edit({
        content: assembledMessage,
      }),
    ]);
  } else {
    // If not inline, it must be a normal message

    const { lang } = timers[0];
    const timeEnd = new Date(timers[0].timeEnd);
    const timeLeft = timeEnd - Date.now();
    const timeElapsed = timers[0].timeStart ? Date.now() - new Date(timers[0].timeStart) : Infinity;

    let editText;

    // If countdown is done
    if (timeLeft < 10000) {
      removeMessageWithReplyId(replyMsgId);
      editText = t("countdownDone", lang);

      // If tag exists, send a new message with the tag.
      if (timers[0].tag) {
        const channel = await client.channels.fetch(channel_id);
        channel.send(`${t("countdownDone", lang)}! ${timers[0].tag}`);
      }
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft, timeElapsed, lang);
      editText = `${t("timeLeft", lang)}: ${humanDiff}`;
      updateRecomputedCountdown({
        replyMsgId,
        nextUpdate: timeEnd - timeLeftForNextUpdate,
        priority: timeLeftForNextUpdate ? 0 : 10,
      });
    }

    await Promise.race([
      timedPromise(),
      new Message(client, {
        id: replyMsgId,
        channel_id,
      }).edit({
        content: editText,
      }),
    ]);
  }
};
