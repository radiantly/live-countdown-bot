import got from "got";
import config from "../config.js";

const { topggAPIkey, discordBotsggAPIkey } = config;

export const postServerCount = async guildSizes => {
  const botId = "710486805836988507";

  const shardCount = guildSizes.length;
  const guildCount = guildSizes.reduce((total, size) => total + size, 0);

  const { body: topggResponse } = await got.post(`https://top.gg/api/bots/${botId}/stats`, {
    headers: {
      Authorization: topggAPIkey,
    },
    json: {
      shards: guildSizes,
    },
  });

  const { body: discordBotsggResponse } = await got.post(
    `https://discord.bots.gg/api/v1/bots/${botId}/stats`,
    {
      headers: {
        Authorization: discordBotsggAPIkey,
      },
      json: {
        guildCount,
        shardCount,
      },
    }
  );

  return [topggResponse, discordBotsggResponse];
};
