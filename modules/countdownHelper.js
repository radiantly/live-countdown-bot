import chrono from "chrono-node";
import { computeTimeDiff } from "./computeTimeDiff.js";

export const parseInline = command => {
  if (!command) return null;
  let commands = [];
  let parts = [];
  for (let i = 1; i <= 5; i++) {
    const match = command.match(/^(.*?)!!countdown ([^!]+)!(.*)$/ims);
    if (match?.length !== 4) break;
    parts.push(match[1]);
    commands.push(match[2].trim().toLowerCase());
    command = match[3];
  }
  if (parts.length) parts.push(command);
  else return null;
  return { commands, parts };
};

const findRoleId = (commandArray, guild) => {
  let tag = commandArray.shift();

  // Check if mention
  if (tag.match(/^<@(&|!)?[0-9]{17,19}>$/)) return tag;

  // Check if snowflake
  if (tag.match(/^[0-9]{17,19}$/))
    // Return role if found. If not, assume user snowflake.
    return guild.roles.cache.find(role => role.id === tag) || `<@${tag}>`;

  // Try to match role name with id.
  while (commandArray.length) {
    const roleId = guild.roles.cache.find(
      role => role.name.toLowerCase().replace(/ /g, "") === tag
    );
    if (roleId) return roleId;
    tag += commandArray.shift();
  }
  return null;
};

export const getTag = (command, message) => {
  const commandArray = command.toLowerCase().split(/ +/);
  const tagdirective = commandArray.shift();

  // Check if tag directive exists
  if (!tagdirective.startsWith("tag")) return { command, tag: null };

  // Check if tagging specific role
  if (tagdirective === "tag") {
    if (commandArray.length < 2)
      return { error: "Syntax: `!countdown tag <rolename> <date/time>`" };
    const tagId = findRoleId(commandArray, message.guild);
    return tagId
      ? { command: commandArray.join(" "), tag: `${tagId}` }
      : { error: "Specified role was not found." };
  }

  // prettier-ignore
  const tag = tagdirective === "tageveryone" ? "@everyone" :
              tagdirective === "taghere" ? "@here" :
              tagdirective === "tagme" ? `${message.author}` : null;
  return tag
    ? { command: commandArray.join(" "), tag }
    : { error: "Accepted tags: tagme/taghere/tageveryone" };
};

const maxTimeEnd = new Date();
maxTimeEnd.setFullYear(maxTimeEnd.getFullYear() + 2);

export const computeCountdown = (command, message) => {
  const countObj = {};

  // Get tag if present
  const tagObj = getTag(command, message);
  if (tagObj.error) return tagObj;
  command = tagObj.command;
  if (tagObj.tag) countObj.tag = tagObj.tag;

  if (["infinity", "\u221E", "\u267E\uFE0F"].includes(command)) return { error: "Seriously? -_-" };

  // Parse time and check if valid
  const timeEnd = chrono.parseDate(command);
  if (!timeEnd) return { error: "Invalid date/time." };
  const timeLeft = timeEnd - Date.now();

  // Check if date/time in the past
  if (timeLeft < 0)
    return {
      error:
        "You are trying to set a countdown to a date/time in the past. " +
        "A common reason for this is the lack of year.",
    };

  if (timeLeft < 55000) return { error: "Too short! Countdowns must be higher than a minute!" };

  if (timeEnd > maxTimeEnd)
    return {
      error:
        ":eyes: That's too far away in the future. Currently, countdowns are limited to 2 years.",
    };

  countObj.timeEnd = timeEnd;
  return countObj;
};

export const assembleInlineMessage = (timers, parts) => {
  let nextUpdate = null;
  let priority = 0;

  const assembled = timers.map((timer, index) => {
    const timeEnd = new Date(timer.timeEnd);
    const timeLeft = timeEnd - Date.now();

    let diff;

    // if countdown is done
    if (timeLeft < 10000) {
      diff = "no minutes";
    } else {
      const { humanDiff, timeLeftForNextUpdate } = computeTimeDiff(timeLeft);

      diff = humanDiff;

      // If next update is the last one, prioritize it
      if (!timeLeftForNextUpdate) priority = 10;

      if (!nextUpdate) nextUpdate = timeEnd;

      // Get nextUpdate time
      const timerNextUpdate = timeEnd - timeLeftForNextUpdate;
      nextUpdate = Math.min(nextUpdate, timerNextUpdate);
    }

    return parts[index] + diff;
  });
  // console.log(assembled);
  assembled.push(parts[parts.length - 1]);

  return { assembledMessage: assembled.join(""), nextUpdate, priority };
};
