export const SECONDS = 1000;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;

export const tokB = bytes => bytes / 1024;
export const toMB = bytes => tokB(bytes) / 1024;
export const toGB = bytes => toMB(bytes) / 1024;
