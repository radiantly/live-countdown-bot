import { loadavg, cpus } from 'os';
import { memoryUsage, version as nodeVersion } from 'process';
import { MessageEmbed, version as djsVersion } from 'discord.js';
import timeDiffForHumans from './timeDiffForHumans.js';
import config from '../config.json';

const { prefix } = config;

const helpEmbed = new MessageEmbed()
    .setColor('#f26522')
    .setDescription('Usage for the Live Countdown Bot')
    .addFields(
        {
            name: 'Set a countdown',
            value: '```' +
                   `${prefix}countdown <Date/Time to countdown to>\n\n` +
                   `Examples:\n` +
                   `${prefix}countdown tomorrow 9 AM PDT\n` +
                   `${prefix}countdown May 24 3:47 PM IST\n\n` +
                   `Inline mode:\n` +
                   `Time till I'm 13 yrs old: !!countdown Aug 31, 10PM GMT! left.\n` +
                   `There are !!countdown 11:59 PM EST! left to capture flags!\n` +
                   '```'
        },
        {
            name: 'Notes',
            value: 'A maximum of 3 countdowns can be set per server.\n' +
                   `In inline mode, the command is between two ${prefix} characters\n` +
                   'To set a countdown, the user must have the `MANAGE_MESSAGES` permission.\n' +
                   `Report a bug or request a feature [here](https://github.com/radiantly/live-countdown-bot 'GitHub repo')`
        }
    )
    .setTimestamp()
    .setFooter('Live Countdown Bot');

const statsEmbed = new MessageEmbed()
    .setColor('#f26522')
    .setTitle('Stats')
    .setTimestamp()
    .setFooter('Live Countdown Bot');

export const generateHelpEmbed = command =>
    helpEmbed.setTitle(`${prefix}${command}`);

export const generateStatsEmbed = client => {
    let { rss } = memoryUsage();
    let memUsage = Math.round(rss / 1024 / 1024 * 100) / 100;
    let osLoad = Math.round(loadavg()[0] / cpus().length * 1E4) / 100;
    let upTime = timeDiffForHumans(client.uptime, true);
    statsEmbed.fields = [
        {
            name: ':fire: CPU usage',
            value: `**${osLoad}%**`,
            inline: true
        },
        {
            name: ':level_slider: Memory',
            value: `**${memUsage}MB**`,
            inline: true
        },
        {
            name: ':clock2: Uptime',
            value: `**${upTime}**`,
            inline: true
        },
        {
            name: ':red_circle: Ping',
            value: `**${client.ws.ping}ms**`,
            inline: true
        },
        {
            name: ':incoming_envelope: Discord.js',
            value: `**${djsVersion}**`,
            inline: true
        },
        {
            name: ':white_check_mark: Node.js',
            value: `**${nodeVersion}**`,
            inline: true
        }

    ];
    return statsEmbed;
}