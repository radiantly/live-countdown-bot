import { PermissionsBitField } from "discord.js";
import { Role } from "discord.js";
import { MAX_ROLES_IN_ALLOWEDMENTIONS, ROLES_REGEX } from "./utils.js";

export const extractRolesFromString = (guild, text) => {
  if (!guild) return [];
  if (typeof text !== "string") return [];
  return [...text.matchAll(ROLES_REGEX)]
    .map(parts => guild.roles.resolve(parts[1]))
    .filter(Boolean);
};

// Generates the allowedMentions object for a given member in a channel for a list of mentions
export const generateAllowedMentions = (member, channel, mentions) => {
  if (!member || !channel) return { parse: [] };

  // if the member has the Mention Everyone permission, then they have permission to tag anyone
  if (member.permissionsIn(channel).has(PermissionsBitField.Flags.MentionEveryone)) {
    return {
      parse: ["users", "roles", "everyone"],
    };
  }

  // if not, they can tag all users, and roles that are mentionable
  return {
    parse: ["users"],
    roles: mentions
      .filter(mention => mention instanceof Role && mention.mentionable)
      .map(role => role.id)
      .slice(0, MAX_ROLES_IN_ALLOWEDMENTIONS),
  };
};
