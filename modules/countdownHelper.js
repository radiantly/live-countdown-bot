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
