const longStrings = {
    lessThanAMinute: "Less than a minute",
    minute: "minute",
    hour: "hour",
    day: "day",
    and: "and"
}
const shortStrings = {
    lessThanAMinute: "< 1min",
    minute: "min",
    hour: "hr",
    day: "day",
    and: "&"
}

const timeDiffForHumans = (ms, short=false) => {
    let strings = short ? shortStrings : longStrings;

    if(ms < 60000) return strings.lessThanAMinute;

    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor(s % 86400 / 3600);
    const minutes = Math.floor(s % 86400 % 3600 / 60);

    let finalString = "";
    if(days) finalString = `${days} ${strings.day}${days > 1 ? 's' : '' } `;
    if(hours) finalString += `${hours} ${strings.hour}${hours > 1 ? 's' : '' } `
    if(minutes) finalString += `${minutes} ${strings.minute}${minutes > 1 ? 's' : '' }`;

    let finalWords = finalString.trim().split(" ");
    if(finalWords.length > 5) finalWords[1] += ",";
    if(finalWords.length > 2) finalWords.splice(-2, 0, strings.and);

    return finalWords.join(" ");
}

export default timeDiffForHumans;