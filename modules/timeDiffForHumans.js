module.exports =  timeDiffForHumans = ms => {
    if(ms < 60000) return "Less than a minute left.";

    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor(s % 86400 / 3600);
    const minutes = Math.floor(s % 86400 % 3600 / 60);

    let finalString = "";
    if(days) finalString = `${days} day${days > 1 ? 's' : '' } `;
    if(hours) finalString += `${hours} hour${hours > 1 ? 's' : '' } `
    if(minutes) finalString += `${minutes} minute${minutes > 1 ? 's' : '' }`;

    let finalWords = finalString.trim().split(" ");
    if(finalWords.length > 5) finalWords[1] += ",";
    if(finalWords.length > 2) finalWords.splice(-2, 0, "and");
    finalWords.push("left");

    return finalWords.join(" ");
}