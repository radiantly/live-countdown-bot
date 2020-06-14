const reactionObj = {
  42: { emotes: ["4️⃣", "2️⃣"], text: "Time left: Infinite." },
  tick: { emotes: ["✅"] },
  cross: { emotes: ["❌"], text: "Invalid." },
  invalidTime: { emotes: ["🕐", "❌"], text: "Invalid date/time." },
};

export const react = async (message, reaction = "cross") => {
  // Permissions required to add a reaction
  const permsRequired = ["ADD_REACTIONS", "READ_MESSAGE_HISTORY"];
  if (message.guild?.me?.permissionsIn(message.channel.id).has(permsRequired) === false)
    // If it doesn't have these perms, send the corresponding text message (if available)
    return reactionObj[reaction].text && message.channel.send(reactionObj[reaction].text);

  // Send reactions
  await Promise.all(reactionObj[reaction].emotes.map(emote => message.react(emote)));
};
