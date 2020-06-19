import { loadavg, cpus } from "os";
import { env, memoryUsage, version as nodeVersion } from "process";
import { MessageEmbed, version as djsVersion } from "discord.js";
import { timeDiffForHumans } from "./timeDiffForHumans.js";
import { getTotalCountdowns, getRedisInfo } from "./db.js";
import config from "../config.json";

const { prefix, maxCountdowns } = config;

const helpEmbed = new MessageEmbed()
  .setColor("#f26522")
  .setDescription("Usage for the Live Countdown Bot")
  .addFields(
    {
      name: "Set a countdown",
      value: `\`${prefix}countdown <Date/Time to countdown to>\``,
    },
    {
      name: "To tag:",
      value: `\`${prefix}countdown [tagme|taghere|tageveryone] <Date/Time to countdown to>\``,
    },
    {
      name: `Inline mode: (put command between two ${prefix} characters)`,
      value: `\` .. ${prefix}${prefix}countdown <Date/Time to countdown to>${prefix} .. \``,
    },
    {
      name: "Examples:",
      value:
        "```\n" +
        `${prefix}countdown 10mins\n` +
        `${prefix}countdown tagme May 24 2021 3:47 PM PDT\n\n` +
        `Time till I'm 13 yrs old: ${prefix}${prefix}countdown Aug 31, 10PM GMT${prefix} left.\n\n` +
        `There is ${prefix}${prefix}countdown taghere 11:59 PM EST${prefix} left to capture flags!\n` +
        "```",
    },
    {
      name: "Notes",
      value:
        `There can be a maximum of ${maxCountdowns} active countdowns per server.\n` +
        "Give me `MANAGE_MESSAGES` permission to delete the inital message.\n" +
        "Find my support server [here](https://discord.com/invite/dxafzkG 'Join the support server!'). " +
        "Invite me from [here](https://top.gg/bot/710486805836988507).",
    }
  )
  .setFooter("Made with ❤️ by LordBusiness#4990");

export const generateHelpFallback = () =>
  `So, how do you use the Live Countdown Bot?

A basic command looks like \`${prefix}countdown 10mins\`
And voila! A message pops up counting down!

You could also tag yourself (or annoy everyone in the server):
\`${prefix}countdown tagme Jun 5 2021 17:30 EST\`

Here's the syntax:
\`${prefix}countdown [tagme|taghere|tageveryone] <Date/Time to countdown to>\`

You can inline commands too, by wrapping it between two ${prefix}
\`I will be king in ${prefix}${prefix}countdown tageveryone Aug 29 13:37 GMT${prefix}. Prepare a banquet by then!\`

A few more examples:
\`\`\`
${prefix}countdown Dec 25, 12:00 CST
${prefix}countdown tagme May 24 2021 3:47 PM PDT
Time till I'm 13 yrs old: ${prefix}${prefix}countdown Aug 31, 10PM GMT${prefix} left.
There is ${prefix}${prefix}countdown taghere 11:59 PM EST${prefix} left to capture flags!
\`\`\`
Links:
Bot page - https://top.gg/bot/710486805836988507`;

export const generateHelpEmbed = command =>
  helpEmbed.setTitle(`${prefix}${command}`).setTimestamp();

export const generateStatsFallback = client => `All good! API Latency is ${client.ws.ping}ms.`;

const statsFooterText =
  env.REF && env.COMMIT_SHA
    ? `Build: ${env.REF.replace(/^.*\//, "")}@${env.COMMIT_SHA.substring(0, 7)}`
    : "Live Countdown Bot";

export const generateStatsEmbed = async client => {
  const { rss } = memoryUsage();
  const memUsage = Math.round((rss / 1024 / 1024) * 100) / 100;
  const osLoad = Math.round((loadavg()[0] / cpus().length) * 1e4) / 100;
  const upTime = timeDiffForHumans(client.uptime, true);
  const { redisVersion, redisMemUsage } = await getRedisInfo();
  const totalCountdowns = await getTotalCountdowns();
  const totalServers = client.guilds.cache.size;
  return new MessageEmbed()
    .setColor("#f26522")
    .setTitle("Stats")
    .addFields(
      {
        name: ":fire: CPU usage",
        value: `**${osLoad}%**`,
        inline: true,
      },
      {
        name: ":level_slider: Memory",
        value: `**${redisMemUsage}** + **${memUsage}M**`,
        inline: true,
      },
      {
        name: ":clock2: Uptime",
        value: `**${upTime}**`,
        inline: true,
      },
      {
        name: ":red_circle: Latency",
        value: `**${client.ws.ping}ms**`,
        inline: true,
      },
      {
        name: ":incoming_envelope: Discord.js",
        value: `**v${djsVersion}**`,
        inline: true,
      },
      {
        name: ":white_check_mark: Node.js",
        value: `**${nodeVersion}**`,
        inline: true,
      },
      {
        name: ":timer: Countdowns",
        value: `**${totalCountdowns}** in **${totalServers}**`,
        inline: true,
      },
      {
        name: ":red_envelope: Redis",
        value: `**v${redisVersion}**`,
        inline: true,
      }
    )
    .setFooter(statsFooterText)
    .setTimestamp();
};
