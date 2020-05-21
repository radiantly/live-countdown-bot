import { Client, Guild, TextChannel, Message } from 'discord.js';
import chrono from 'chrono-node';
import process from 'process';
import config from './config.json';
import timeDiffForHumans from './modules/timeDiffForHumans.js';
import { generateHelpEmbed, generateStatsEmbed } from './modules/embed.js';
import { redis, addCountdown, getMessages, removeMessage, trimMessages, log, getLogs } from './modules/db.js';

const activities = [
    { name: 'the clock tick', type: 'WATCHING' },
    { name: 'the time fly by', type: 'WATCHING' },
    { name: 'the clock tick', type: 'LISTENING' },
    { name: 'with time', type: 'PLAYING' }
];

const client = new Client({ presence: { activity: activities[Math.floor(Math.random() * activities.length)] } });
const { prefix, token, botOwner, maxCountdowns } = config;

const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const inlineCommandPattern = new RegExp(`^(.*)${escapedPrefix}(${escapedPrefix}[^${escapedPrefix}]+)${escapedPrefix}(.*)$`, 'sm');
client.once('ready', () => {
    log('Bot initialized.');
    periodicUpdate();
});

client.on('message', message => {
    // Check if author is a bot
    if (message.author.bot) return;

    // Check if we're allowed to send messages in the channel
    if (message.guild?.me?.permissionsIn(message.channel.id).has('SEND_MESSAGES') === false) return;
    
    const inlineContent = message.content.match(inlineCommandPattern);
    const inline = inlineContent?.length === 4;

    if (!inline && !message.content.startsWith(prefix)) return;

    const content = inline ? inlineContent[2] : message.content;
    const args = content.slice(prefix.length).split(/ +/);
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
            return message.reply(`You didn't provide any arguments, ${message.author}!`);
        
        let MessageObj = {}
        if (args[0].startsWith('tag')) {
            const subcommand = args.shift().toLowerCase().replace(/-/g, '');
            MessageObj.tag = subcommand === 'tageveryone' ? '@everyone' :
                             subcommand === 'taghere' ? '@here' :
                             subcommand === 'tagme' ? `<@${message.author.id}>` : '';
            if(!MessageObj.tag)
                return message.reply('Invalid tag specifier :thinking:');
        }
        const date = chrono.parseDate(args.join(" "));
        if(date)
            if(message.guild?.available) {
                if(!message.member.hasPermission('MANAGE_MESSAGES'))
                    return message.reply('You need to have the \`MANAGE_MESSAGES\` permission to set a countdown!');

                const timeEnd = new Date(date);
                const timeLeft = timeEnd - Date.now();
                if(timeLeft < 10000)
                    return message.reply(`ehh .. unless you have can warp time to go backwards, there's no way you can count back to \`${timeEnd.toUTCString()}\``);
                
                let reply = `Time left: ${timeDiffForHumans(timeLeft)} left.`;
                if(inline) {
                    MessageObj.content = [ inlineContent[1], inlineContent[3] ];
                    reply = `${inlineContent[1]}${timeDiffForHumans(timeLeft)}${inlineContent[3]}`
                }
                return message.channel.send(reply)
                    .then(replyMessage => {
                        if(!replyMessage?.id || !replyMessage.guild?.id || !replyMessage.channel?.id) return;
                        MessageObj = {
                            messageId: replyMessage.id, 
                            channelId: replyMessage.channel.id,
                            timeEnd: timeEnd,
                            ...MessageObj
                        }
                        addCountdown(replyMessage.guild.id, MessageObj);
                    });
            } else {
                return message.channel.send('The date/time is valid, but this bot can only be used in servers.');
            }
        else
            return message.channel.send(`Invalid date/time.`);
    }

    if (message.author?.id === botOwner) {
        if (command === 'logs')
            getLogs()
                .then(results => message.channel.send('```' + results.join('\n') + '```'))
                .catch(err => log(err));
        
        if (command === 'kill')
            process.exit();
    }
});

let index = 0

let guild = new Guild(client, {});
let channel = new TextChannel(guild, {});
let messageToEdit = new Message(client, {}, channel);

const periodicUpdate = async () => {
    const timeNow = Date.now();
    if(index >= maxCountdowns) {
        await trimMessages(index);
        index = 0;
    } else {
        const Messages = await getMessages(index);
        for(const { serverId, MessageString } of Messages) {
            try {
                const MessageObj = JSON.parse(MessageString);
                const { messageId, channelId, timeEnd } = MessageObj;
                messageToEdit.guild.id = serverId;
                messageToEdit.channel.id = channelId;
                messageToEdit.id = messageId;

                const timeLeft = Date.parse(timeEnd) - timeNow;

                if(timeLeft <= 0) {
                    let finalText = MessageObj.hasOwnProperty('content') ? 
                                    `${MessageObj.content[0]}no minutes${MessageObj.content[1]}` :
                                    "Countdown done.";
                    if(MessageObj.tag)
                        finalText += ` ${MessageObj.tag}`
                    await messageToEdit.edit(finalText);
                    removeMessage(serverId, MessageString);
                    continue;
                }
                const editedText = MessageObj.hasOwnProperty('content') ?
                                `${MessageObj.content[0]}${timeDiffForHumans(timeLeft)}${MessageObj.content[1]}` :
                                `Time left: ${timeDiffForHumans(timeLeft)} left.`;
                await messageToEdit.edit(editedText);
            } catch (ex) {
                log(ex);
                removeMessage(serverId, MessageString);
            }
        }
        index = Messages.length ? index + 1 : 0;
    }
    client.setTimeout(periodicUpdate, Math.max(5000 - (Date.now() - timeNow), 0));
}

process.on('unhandledRejection', reason => log(reason));

// Only bother starting client if redis starts up
redis.once('ready', () => client.login(token));