import { log } from "./db.js";

const reactionObj = {
  42: { emotes: ["4️⃣", "2️⃣"], text: "Time left: Infinite." },
  tick: { emotes: ["✅"] },
  cross: { emotes: ["❌"], text: "Invalid." },
  invalidTime: { emotes: ["🕐", "❌"], text: "Invalid date/time." },
};

export const react = async (message, reaction = "cross") => {
  if (!reactionObj.hasOwnProperty(reaction)) throw new Error("Reaction does not exist");

  if (
    reactionObj[reaction].text &&
    message.guild?.me?.permissionsIn(message.channel.id).has("ADD_REACTIONS") === false
  )
    return message.channel.send(reactionObj[reaction].text);

  for (const emote of reactionObj[reaction].emotes)
    await message.react(emote).catch(err => log(`Reaction failed ${err}`));
};
