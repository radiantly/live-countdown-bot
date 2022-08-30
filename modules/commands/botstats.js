import { EmbedBuilder, version as djsVersion } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import { loadavg, cpus } from "os";

import { getClusterDataSum, version as sqliteVersion } from "../sqlite3.js";
import { toMB } from "../utils.js";

export const botstatsCommand = new SlashCommandBuilder()
  .setName("botstats")
  .setDescription("Check bot statistics");

export const botstatsHandler = async interaction => {
  const cpuUsage = (loadavg()[0] / cpus().length).toFixed(2);
  const memUsage = Math.floor(toMB(process.memoryUsage().rss));
  const memUsageTotal = Math.floor(toMB(getClusterDataSum("rss")));
  const embed = new EmbedBuilder()
    .setColor("#f26522")
    .setTitle("Stats")
    .addFields(
      {
        name: ":fire: CPU usage",
        value: `**${cpuUsage}%**`,
        inline: true,
      },
      {
        name: ":level_slider: Memory",
        value: `**${memUsage}/${memUsageTotal}M**`,
        inline: true,
      },
      {
        name: ":clock2: Uptime",
        value: `**Started <t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>**`,
        inline: true,
      },
      {
        name: ":red_circle: Latency",
        value: `**${interaction.client.ws.ping}ms**`,
        inline: true,
      },
      {
        name: ":incoming_envelope: Discord.js",
        value: `**v${djsVersion}**`,
        inline: true,
      },
      {
        name: ":white_check_mark: Node.js",
        value: `**${process.version}**`,
        inline: true,
      },
      {
        name: ":timer: Servers",
        value: `**${getClusterDataSum("guildCount")}**`,
        inline: true,
      },
      {
        name: ":red_envelope: SQLite3",
        value: `**v${sqliteVersion}**`,
        inline: true,
      }
    )
    .setTimestamp();
  interaction.reply({ embeds: [embed], ephemeral: true });
};
