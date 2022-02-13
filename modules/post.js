import got from "got";
import config from "../config.js";

export const postServerCount = async guildCount => {
  const botId = "710486805836988507";

  const { body: topggResponse } = await got.post(`https://top.gg/api/bots/${botId}/stats`, {
    headers: {
      Authorization: config.topggAPIkey,
    },
    json: {
      server_count: guildCount,
    },
  });

  const { body: discordBotsggResponse } = await got.post(
    `https://discord.bots.gg/api/v1/bots/${botId}/stats`,
    {
      headers: {
        Authorization: config.discordBotsggAPIkey,
      },
      json: {
        guildCount,
      },
    }
  );

  return [topggResponse, discordBotsggResponse];
};
