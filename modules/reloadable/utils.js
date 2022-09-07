export const MILLISECONDS = 1;
export const SECONDS = 1000 * MILLISECONDS;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;

export const tokB = bytes => bytes / 1024;
export const toMB = bytes => tokB(bytes) / 1024;
export const toGB = bytes => toMB(bytes) / 1024;

// javascript timestamps are in milliseconds
export const toSecs = timestamp => Math.floor(timestamp / 1000);

export const ROLES_REGEX = /<@&(\d+)>/g;

// https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure
export const MAX_ROLES_IN_ALLOWEDMENTIONS = 100;

// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete
export const MAX_AUTOCOMPLETE_CHOICES = 25;

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure
export const MAX_LENGTH_STRING_CHOICE = 100;
