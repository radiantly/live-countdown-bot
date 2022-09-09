import { config } from "../config.js";

export const postServerCount = async guildCount => {
  const results = [];

  if (config.topggAPIkey) {
    const response = await fetch(`https://top.gg/api/bots/${config.botId}/stats`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: config.topggAPIkey,
      },
      body: JSON.stringify({ server_count: guildCount }),
    });
    if (response.status !== 200) console.error("Failed to post server count to top.gg");
    results.push(response.status);
  }

  if (config.discordBotsggAPIkey) {
    const response = await fetch(`https://discord.bots.gg/api/v1/bots/${config.botId}/stats`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: config.discordBotsggAPIkey,
      },
      body: JSON.stringify({ guildCount }),
    });
    if (response.status !== 200) console.error("Failed to post server count to discord.bots.gg");
    results.push(response.status);
  }
  return results;
};
