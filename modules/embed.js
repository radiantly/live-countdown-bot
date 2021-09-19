import { loadavg, cpus } from "os";
import { version as nodeVersion } from "process";
import { MessageEmbed, version as djsVersion } from "discord.js";
import { getTotalCountdowns, version as sqliteVersion } from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";
import config from "../config.js";
import { timedPromise } from "./updateManager.js";
import { getGitInfo } from "./gitinfo.js";

const { channelMax } = config;

export const generateHelpFallback = prefix =>
  `So, how do you use the Live Countdown Bot?

A basic command looks like \`${prefix}countdown 10mins\`
And voila! A message pops up counting down!

You could also tag yourself (or annoy everyone in the server):
\`${prefix}countdown tagme Jun 5 2021 17:30 EST\`

Here's the syntax:
\`${prefix}countdown [tagme|taghere|tageveryone] <Date/Time to countdown to>\`

You can inline commands too, by wrapping it between two !
\`I will be king in !!countdown tageveryone Aug 29 13:37 GMT!. Prepare a banquet by then!\`

A few more examples:
\`\`\`
${prefix}countdown Dec 25, 12:00 CST
${prefix}countdown tagme May 24 2021 3:47 PM PDT
Time till I'm 13 yrs old: !!countdown Aug 31, 10PM GMT$! left.
There is !!countdown taghere 11:59 PM EST$! left to capture flags!
\`\`\`
Links:
Bot page - https://top.gg/bot/710486805836988507`;

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

export const generateHelpEmbed = prefix => {
  const g = (strings, ...keys) =>
    "`" +
    (strings[0].startsWith("cd") ? prefix : "") +
    strings[0].replace(/cd/g, "countdown") +
    keys.map((key, i) => key + strings[i + 1]).join("") +
    "`";
  const nextMonth = () =>
    new Date("2000", (new Date().getMonth() + 1) % 12).toLocaleString("default", {
      month: "short",
    });
  return new MessageEmbed()
    .setTitle(`${prefix}help`)
    .setColor("#f26522")
    .setDescription("Usage for the Live Countdown Bot")
    .addFields(
      {
        name: "Set a countdown",
        value: g`cd <Date/Time to cd to>` + "\nExample: " + g`cd 10mins`,
      },
      {
        name: "To tag:",
        value:
          g`cd [tagme|taghere|tageveryone] <Date/Time to cd to>` +
          "\nExample: " +
          g`cd tagme Jan 21 9AM CEST`,
      },
      {
        name: `Inline mode: (put command between two ! characters)`,
        value:
          g` .. !!cd <Date/Time to cd to>! .. ` +
          "\nExample: " +
          g`Time till I'm 13 yrs old: !!cd ${nextMonth()} 27, 10PM EDT! left.`,
      },
      {
        name: "More Examples:",
        value:
          g`cd 10:30 PM PDT` +
          "\n" +
          g`cd tageveryone 1 hour 43mins` +
          "\n" +
          g`There is !!cd taghere 11:59 PM EST! left to capture flags!`,
      },
      {
        name: "Notes",
        value:
          `There can be ${channelMax} active countdowns per channel.\n` +
          "Give me `MANAGE_MESSAGES` permission to delete the inital message.\n" +
          `Current prefix is \`${prefix}\`. Use \`${prefix}setprefix\` to change it.\n` +
          "Find my support server [here](https://discord.com/invite/b2fY4z4xBY 'Join the support server!'). " +
          "Invite me from [here](https://top.gg/bot/710486805836988507).",
      }
    )
    .setFooter(
      `Special thanks to ${rand(["Pr€d∆†๏r™", "Loco Musician", "Zetas2", "Pocket"])} for ${rand([
        "moderating the support server",
        "helping with moderation",
        "being cool",
      ])}.`
    );
};
export const generateStatsFallback = client => `All good! API Latency is ${client.ws.ping}ms.`;

let statsFooterText = "Live Countdown Bot";
Promise.race([timedPromise(), getGitInfo()]).then(gitinfo => (statsFooterText = gitinfo));

const toMB = num => num / 1024 / 1024;
const to2Decimals = num => Math.round(num * 100) / 100;
export const generateStatsEmbed = async client => {
  const memUsage = await client.shard
    .broadcastEval(client => process.memoryUsage().rss)
    .then(memUsages => memUsages.reduce((total, rss) => total + rss, 0))
    .catch(console.error);
  const memUsageRounded = Math.round(toMB(memUsage));
  const shardMemUsage = to2Decimals(toMB(process.memoryUsage().rss));
  const osLoad = Math.round((loadavg()[0] / cpus().length) * 1e4) / 100;
  const upTime = computeTimeDiff(client.uptime, Infinity, "en", true).humanDiff;
  const totalCountdowns = getTotalCountdowns();
  const totalServers = await client.shard
    .fetchClientValues("guilds.cache.size")
    .then(sizes => sizes.reduce((total, size) => total + size, 0))
    .catch(console.error);

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
        value: `**${shardMemUsage}/${memUsageRounded}M**`,
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
        name: ":red_envelope: SQLite3",
        value: `**v${sqliteVersion}**`,
        inline: true,
      }
    )
    .setFooter(statsFooterText)
    .setTimestamp();
};
