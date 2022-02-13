import { loadavg, cpus } from "os";
import { version as nodeVersion } from "process";
import { MessageEmbed, version as djsVersion } from "discord.js";
import { getTotalCountdowns, version as sqliteVersion, getClusterStats } from "./sqlite3.js";
import { computeTimeDiff } from "./computeTimeDiff.js";
import config from "../config.js";
import { timedPromise } from "./updateManager.js";
import { getGitInfo } from "./gitinfo.js";
import { helpers, awesomeBackers, backers } from "./people.js";
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

const choose1from = arr => arr[Math.floor(Math.random() * arr.length)];

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const backerToStr = backer => `[${backer.discord}](${backer.link} '${backer.name}')`;

export const generateHelpEmbed = prefix => {
  const nextMonth = () =>
    new Date("2000", (new Date().getMonth() + 1) % 12).toLocaleString("default", {
      month: "short",
    });
  return new MessageEmbed()
    .setTitle(`${prefix}help - Usage for the Live Countdown Bot`)
    .setColor("#f26522")
    .setDescription("Request a post from the bot that it edits to simulate a countdown.")
    .addFields(
      {
        name: "Set a countdown",
        value: `\`${prefix}countdown DATE/TIME\`\n` + `\`${prefix}countdown 10mins\``,
      },
      {
        name: "To tag:",
        value:
          `\`${prefix}countdown [tagme|taghere|tageveryone] DATE/TIME\`\n` +
          `Ex: \`${prefix}countdown tagme Jan 21 9AM CEST\``,
      },
      {
        name: `Inline mode: (put command between two ! characters)`,
        value:
          `\` .. !!countdown DATE/TIME! .. \`\n` +
          `Ex: \`Time till I turn 13: !!countdown ${nextMonth()} 27, 10PM EDT! left.\``,
      },
      {
        name: "More Examples:",
        value:
          `\`countdown 10:30 PM PDT\`\n` +
          `\`countdown tageveryone 1 hour 43mins\`\n` +
          `\`There's !!countdown taghere 11:59 PM EST! left in the game!\``,
      },
      {
        name: "Notes",
        value:
          `There can be ${channelMax} active countdowns per channel.\n` +
          "Give me `MANAGE_MESSAGES` permission to delete the inital message.\n" +
          `Current prefix is \`${prefix}\`. Use \`${prefix}setprefix\` to change it.\n` +
          "[Discord Support](https://discord.com/invite/b2fY4z4xBY 'Join the support server!') | " +
          "[Invite the Bot](https://top.gg/bot/710486805836988507) | " +
          "[Patreon](https://www.patreon.com/livecountdownbot)",
      },
      {
        name: "Sponsors",
        value: `A huge thank you to ${shuffle([...awesomeBackers, choose1from(backers)])
          .map(backerToStr)
          .join(
            ", "
          )} and [others](https://www.patreon.com/livecountdownbot 'Support the development of the bot on Patreon!') for supporting the bot.`,
      }
    )
    .setFooter({
      text: `Also, special thanks to ${choose1from(helpers)} for ${choose1from([
        "moderating the support server",
        "helping with moderation",
      ])}.`,
    });
};
export const generateStatsFallback = client => `All good! API Latency is ${client.ws.ping}ms.`;

let statsFooterText = "Live Countdown Bot";
Promise.race([timedPromise(), getGitInfo()]).then(gitinfo => (statsFooterText = gitinfo));

const toMB = num => num / 1024 / 1024;
const to2Decimals = num => Math.round(num * 100) / 100;
export const generateStatsEmbed = async client => {
  const clusterStats = getClusterStats();
  const memUsageRounded = Math.round(toMB(clusterStats["TOTAL(RAM)"]));
  const shardMemUsage = to2Decimals(toMB(process.memoryUsage().rss));
  const osLoad = Math.round((loadavg()[0] / cpus().length) * 1e4) / 100;
  const upTime = computeTimeDiff(client.uptime, Infinity, "en", true).humanDiff;
  const totalCountdowns = getTotalCountdowns();

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
        value: `**${totalCountdowns}** in **${clusterStats["TOTAL(GuildCount)"]}**`,
        inline: true,
      },
      {
        name: ":red_envelope: SQLite3",
        value: `**v${sqliteVersion}**`,
        inline: true,
      }
    )
    .setFooter({ text: statsFooterText })
    .setTimestamp();
};
