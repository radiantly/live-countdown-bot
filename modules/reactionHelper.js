const reactionObj = {
  42: ["4️⃣", "2️⃣"],
  tick: ["✅"],
  cross: ["❌"],
  lock: ["🔒"],
  invalidTime: ["🕐", "❌"],
  invalidTimeRev: ["🕜", "❌"],
  notAllowed: ["🚫"],
};

export const react = async (message, reaction = "cross") => {
  if (!reactionObj.hasOwnProperty(reaction)) throw new Error("Reaction does not exist");

  for (const emote of reactionObj[reaction])
    await message.react(emote).catch(err => log(`Reaction failed ${err}`));
};
