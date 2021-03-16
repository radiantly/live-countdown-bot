import { t } from "./lang.js";

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

export const computeTimeDiff = (timeLeftms, lang = "en", short = false) => {
  let strings = short ? t("shortStrings", lang) : t("longStrings", lang);

  if (timeLeftms < oneMin)
    return {
      timeLeftForNextUpdate: 0,
      humanDiff: strings.lessThanAMinute,
    };

  /* Compute track:
   * 1 -> Show days, hours & minutes
   * 5 -> Show days & hours
   * 9 -> Show days
   */
  const track = timeLeftms < 2 * oneWks ? (timeLeftms < 6 * oneHrs ? 1 : 5) : 9;

  // const weeks = Math.floor(timeLeftms / oneWks);
  const days = Math.floor(timeLeftms / oneDay);
  const hours = Math.floor((timeLeftms % oneDay) / oneHrs);
  const minutes = Math.floor((timeLeftms % oneHrs) / oneMin);

  const stringGen = (num, str) =>
    `${num} ${num == 1 ? strings[str] : strings[str + "s"] || strings[str] + "s"}`;
  let finalString = "";
  // if (weeks) finalString = stringGen(weeks, "week") + " ";
  if (days) finalString = stringGen(days, "day") + " ";
  if (hours && track < 9) finalString += stringGen(hours, "hour") + " ";
  if (minutes && track < 5) finalString += stringGen(minutes, "minute");

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
