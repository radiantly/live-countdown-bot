const longStrings = {
  lessThanAMinute: "less than a minute",
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

const oneSec = 1000;
const oneMin = 60 * oneSec;
const oneHrs = 60 * oneMin;
const oneDay = 24 * oneHrs;
const oneWks = 7 * oneDay;

const trackUpdate = {
  1: oneMin,
  5: oneHrs,
  9: oneDay,
};

export const computeTimeDiff = (timeLeftms, short = false) => {
  let strings = short ? shortStrings : longStrings;

  if (timeLeftms < oneMin)
    return {
      timeLeftForNextUpdate: 0,
      humanDiff: strings.lessThanAMinute,
    };

  /* Compute track:
   * 1 -> Show days, hours & minutes
   * 5 -> Show weeks, days & hours
   * 9 -> Show weeks & days
   */
  const track = timeLeftms < 2 * oneWks ? (timeLeftms < 2 * oneDay ? 1 : 5) : 9;

  const weeks = Math.floor(timeLeftms / oneWks);
  const days = Math.floor((timeLeftms % oneWks) / oneDay);
  const hours = Math.floor((timeLeftms % oneDay) / oneHrs);
  const minutes = Math.floor((timeLeftms % oneHrs) / oneMin);

  let finalString = "";
  if (weeks) finalString = `${weeks} ${strings.week}${weeks > 1 ? "s" : ""} `;
  if (days) finalString += `${days} ${strings.day}${days > 1 ? "s" : ""} `;
  if (hours && track < 9) finalString += `${hours} ${strings.hour}${hours > 1 ? "s" : ""} `;
  if (minutes && track < 5) finalString += `${minutes} ${strings.minute}${minutes > 1 ? "s" : ""}`;

  let finalWords = finalString.trim().split(" ");
  if (finalWords.length > 5) finalWords[1] += ",";
  if (finalWords.length > 2) finalWords.splice(-2, 0, strings.and);

  let timeLeftForNextUpdate = timeLeftms - (timeLeftms % trackUpdate[track]);
  if (timeLeftms <= timeLeftForNextUpdate + 10000) timeLeftForNextUpdate -= trackUpdate[track];
  return {
    timeLeftForNextUpdate,
    humanDiff: finalWords.join(" "),
  };
};

computeTimeDiff(3540000, true);
