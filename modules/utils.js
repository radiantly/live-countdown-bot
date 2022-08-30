export const seconds = 1000;
export const minutes = 60 * seconds;
export const hours = 60 * minutes;
export const days = 24 * hours;

export const tokB = bytes => bytes / 1024;
export const toMB = bytes => tokB(bytes) / 1024;
export const toGB = bytes => toMB(bytes) / 1024;
