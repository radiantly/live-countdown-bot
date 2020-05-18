import { Client, Guild, TextChannel, Message } from 'discord.js';
import chrono from 'chrono-node';
import { exit } from 'process';
import config from './config.json';
import timeDiffForHumans from './modules/timeDiffForHumans.js';
import { generateHelpEmbed, generateStatsEmbed } from './modules/embed.js';
import { addCountdown, getMessages, removeMessage, log, getLogs } from './modules/db.js';

const activities = [
    { name: 'the clock tick', type: 'WATCHING' },
    { name: 'the time fly by', type: 'WATCHING' },
    { name: 'the clock tick', type: 'LISTENING' },
    { name: 'with time', type: 'PLAYING' }
]

const client = new Client({ presence: { activity: activities[Math.floor(Math.random() * activities.length)] } });
const { prefix, token, botOwner } = config;

client.once('ready', () => {
    log('Bot initialized.');
    periodicUpdate();
});

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Display help message
    if (['help', 'commands', 'usage'].includes(command))
        return message.channel.send(generateHelpEmbed(command));

    // Show process stats
    if (command === 'stats')
        return message.channel.send(generateStatsEmbed(client));

    // Start a countdown
    if (command === 'countdown') {
        if (!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        
        const date = chrono.parseDate(args.join(" "));
        if(date)
            if(message.guild?.available) {
                if(!message.member.hasPermission('MANAGE_MESSAGES'))
                    return message.reply('You need to have the \`MANAGE_MESSAGES\` permission to set a countdown!');

                let timeEnd = new Date(date);
                if(timeEnd < Date.now())
                    return message.reply(`ehh .. unless you have can warp time to go backwards, there's no way you can count back to \`${timeEnd.toUTCString()}\``);
                
                return message.channel.send(`Counting down to \`${timeEnd.toUTCString()}\``)
                    .then(replyMessage => addCountdown(replyMessage, timeEnd))
                    .catch(err => log(err.message || err));
            } else {
                return message.channel.send('The date/time is valid, but this bot can only be used in servers.');
            }
        else 
            return message.channel.send(`Invalid date/time.`)
    }

    if (message.author?.id === botOwner) {
        if (command === 'logs')
            getLogs()
                .then(results => message.channel.send('```' + results.join('\n') + '```'))
                .catch(err => log(err));
        
        if (command === 'kill')
            exit();
    }
});

const maxCountdowns = 5;
let index = 0

let guild = new Guild(client, {});
let channel = new TextChannel(guild, {});
let messageToEdit = new Message(client, {}, channel);

const periodicUpdate = async () => {
    const timeNow = Date.now();
    const Messages = await getMessages(index);
    for(const Message of Messages) {
        try {
            const { serverId, MessageString } = Message;
            const { messageId, channelId, timeEnd } = JSON.parse(MessageString);
            messageToEdit.guild.id = serverId;
            messageToEdit.channel.id = channelId;
            messageToEdit.id = messageId

            const timeLeft = Date.parse(timeEnd) - timeNow;

            if(timeLeft <= 0) {
                await messageToEdit.edit("Countdown done.");
                removeMessage(serverId, MessageString);
                continue;
            }
            await messageToEdit.edit(`Time left: ${timeDiffForHumans(timeLeft)} left.`);
        } catch (ex) {
            log(ex);
        }
    }
    index = index < maxCountdowns ? index + 1 : 0;
    client.setTimeout(periodicUpdate, Math.max(5000 - (Date.now() - timeNow), 0));
}

client.login(token);
