import child_process from "child_process";
import util from "util";
import {
  bold,
  version as djsVersion,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

import { loadavg, cpus, freemem, totalmem } from "os";
import { authorizedUsers } from "../people.js";

import { getAllClusterData, getClusterDataSum, kv, version as sqliteVersion } from "../sqlite3.js";
import { toMB, toSecs } from "../utils.js";
import { dbPath } from "../../db.js";

export const botstatsCommand = new SlashCommandBuilder()
  .setName("botstats")
  .setDescription("Check bot statistics");

const exec = util.promisify(child_process.exec);

/**
 * Handler for the command above
 * @param {ChatInputCommandInteraction} interaction
 */
const chatInputHandler = async interaction => {
  const embeds = [];

  /// Stats Embed
  const cpuUsage = (loadavg()[0] / cpus().length).toFixed(2);
  const memUsage = Math.floor(toMB(process.memoryUsage().rss));
  const memUsageTotal = Math.floor(toMB(totalmem() - freemem()));
  const statsEmbed = new EmbedBuilder().setColor(Colors.Orange).setTitle("Stats");

  // if there are any news items to display
  const news = kv.news;
  if (news) {
    const newsitems = JSON.parse(news)
      .slice(-5)
      .reverse()
      .map(({ time, text }) => `<t:${toSecs(time)}:f> ${text}`)
      .join("\n");

    statsEmbed.addFields({
      name: ":newspaper: News",
      value: newsitems,
    });
  }

  statsEmbed
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
        value: `**${Math.ceil(interaction.client.ws.ping)}ms**`,
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

  embeds.push(statsEmbed);

  /// Additional Embed (Authorized users only!)
  if (authorizedUsers.has(interaction.user.id)) {
    const { stdout: stdoutLsof } = await exec(`lsof -t "${dbPath}"`);
    const openConnections = stdoutLsof.trim().split("\n").length;

    const additionalEmbed = new EmbedBuilder()
      .setTitle("Additional Information")
      .setDescription(`Authorization check succeeded for user ${interaction.user}`)
      .addFields(
        {
          name: ":cloud_lightning: Unhandled Rejections",
          value: `**${kv.unhandledRejectionCount ?? 0}**`,
          inline: true,
        },
        {
          name: ":x: Uncaught Exceptions",
          value: `**${kv.uncaughtExceptionCount ?? 0}**`,
          inline: true,
        },
        {
          name: ":open_file_folder: SQLite Connections",
          value: bold(openConnections.toString()),
          inline: true,
        },
        {
          name: ":control_knobs: Clusters",
          value: getAllClusterData()
            .map(({ id, data }) => {
              const { readyAt, guildCount } = JSON.parse(data);
              return bold(`<t:${toSecs(readyAt)}:R> / ${guildCount} / ${id}`);
            })
            .join("\n"),
          inline: true,
        }
      );
    embeds.push(additionalEmbed);
  }

  interaction.reply({ embeds, ephemeral: true });
};

export const handlers = {
  command: botstatsCommand,
  chatInput: chatInputHandler,
};
