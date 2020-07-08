import { request } from "https";
import { log } from "./db.js";
import config from "../config.json";

const { topggAPIkey, discordBotsggAPIkey, discordBotscoAPIkey } = config;

const postJSON = (url, jsonString, headers) => {
  const req = request(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": jsonString.length,
        ...headers,
      },
    },
    response => {
      if (response.statusCode !== 200) log(`${response.statusCode} from ${url}`);
      response.resume();
      response.on("end", () => {
        if (!response.complete) log(`Connection to ${url} was terminated.`);
      });
    }
  );
  req.on("error", e => log(e));
  req.write(jsonString);
  req.end();
};

export const postServerCount = client => {
  const botId = client.user.id;
  const serverCount = client.guilds.cache.size;

  const topggData = JSON.stringify({ server_count: serverCount });
  postJSON(`https://top.gg/api/bots/${botId}/stats`, topggData, {
    Authorization: topggAPIkey,
  });

  // bots.ondiscord.xyz
  // const botsOnDiscordData = JSON.stringify({ guildCount: serverCount });
  // postJSON(`https://bots.ondiscord.xyz/bot-api/bots/${botId}/guilds`, botsOnDiscordData, {
  //   Authorization: botsOnDiscordAPIkey,
  // });

  const discordBotsggData = JSON.stringify({ guildCount: serverCount });
  postJSON(`https://discord.bots.gg/api/v1/bots/${botId}/stats`, discordBotsggData, {
    Authorization: discordBotsggAPIkey,
  });

  const discordBotscoData = JSON.stringify({ serverCount });
  postJSON(`https://api.discordbots.co/v1/public/bot/${botId}/stats`, discordBotscoData, {
    Authorization: discordBotscoAPIkey,
  });
};
