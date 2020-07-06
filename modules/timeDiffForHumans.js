const longStrings = {
  lessThanAMinute: "Less than a minute",
  minute: "minute",
  hour: "hour",
  day: "day",
  week: "week",
  and: "and",
};
const shortStrings = {
  lessThanAMinute: "< 1min",
  minute: "min",
  hour: "hr",
  day: "day",
  week: "wk",
  and: "&",
};

export const timeDiffForHumans = (ms, short = false) => {
  let strings = short ? shortStrings : longStrings;

  if (ms < 60000) return strings.lessThanAMinute;

  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor(((s % 86400) % 3600) / 60);

  let finalString = "";
  if (days) finalString = `${days} ${strings.day}${days > 1 ? "s" : ""} `;
  if (hours) finalString += `${hours} ${strings.hour}${hours > 1 ? "s" : ""} `;
  if (minutes) finalString += `${minutes} ${strings.minute}${minutes > 1 ? "s" : ""}`;

  let finalWords = finalString.trim().split(" ");
  if (finalWords.length > 5) finalWords[1] += ",";
  if (finalWords.length > 2) finalWords.splice(-2, 0, strings.and);

  return finalWords.join(" ");
};

const oneSec = 1000;
const oneMin = 60 * oneSec;
const oneHrs = 60 * oneMin;
const oneDay = 24 * oneHrs;
const oneWks = 7 * oneDay;

const trackUpdate = {
  1: oneMin,
  2: oneHrs,
  3: oneDay,
};

export const computeTimeDiff = (timeLeftms, short = false) => {
  let strings = short ? shortStrings : longStrings;

  if (timeLeftms < oneMin)
    return {
      nextUpdate: 0,
      humanDiff: strings.lessThanAMinute,
    };

  /* Compute track:
   * 1 -> Show days, hours & minutes
   * 2 -> Show weeks, days & hours
   * 3 -> Show weeks & days
   */
  const track = timeLeftms < 2 * oneWks ? (timeLeftms < 2 * oneDay ? 1 : 2) : 3;

  const weeks = Math.floor(timeLeftms / oneWks);
  const days = Math.floor((timeLeftms % oneWks) / oneDay);
  const hours = Math.floor((timeLeftms % oneDay) / oneHrs);
  const minutes = Math.floor((timeLeftms % oneHrs) / oneMin);

  let finalString = "";
  if (weeks) finalString = `${weeks} ${strings.week}${weeks > 1 ? "s" : ""} `;
  if (days) finalString += `${days} ${strings.day}${days > 1 ? "s" : ""} `;
  if (hours && track < 3) finalString += `${hours} ${strings.hour}${hours > 1 ? "s" : ""} `;
  if (minutes && track < 2) finalString += `${minutes} ${strings.minute}${minutes > 1 ? "s" : ""}`;

  let finalWords = finalString.trim().split(" ");
  if (finalWords.length > 5) finalWords[1] += ",";
  if (finalWords.length > 2) finalWords.splice(-2, 0, strings.and);

  return {
    nextUpdate: timeLeftms - (timeLeftms % trackUpdate[track]) - trackUpdate[track],
    humanDiff: finalWords.join(" "),
  };
};
