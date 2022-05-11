import config from "../config.js";

export const postServerCount = async guildCount => {
  const botId = "710486805836988507";

  const topggResponse = await fetch(`https://top.gg/api/bots/${botId}/stats`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: config.topggAPIkey,
    },
    body: JSON.stringify({ server_count: guildCount }),
  }).then(res => res.json());

  const discordBotsggResponse = await fetch(`https://discord.bots.gg/api/v1/bots/${botId}/stats`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: config.discordBotsggAPIkey,
    },
    body: JSON.stringify({ guildCount }),
  }).then(res => res.json());

  return [topggResponse, discordBotsggResponse];
};
