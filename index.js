const Discord = require('discord.js');
const chrono = require('chrono-node');

const client = new Discord.Client();
const { prefix, token, updateInterval } = require('./config.json');
const timeDiffForHumans = require('./modules/timeDiffForHumans');

client.once('ready', () => {
    console.log('Bot initialized.');
    updateCountdown();
});

const Servers = {}

const helpEmbed = new Discord.MessageEmbed()
    .setColor('#f26522')
    .setTitle(`${prefix}help`)
    .setDescription('Usage for the Live Countdown Bot')
    .addFields(
        {
            name: 'Set a countdown',
            value: '```' +
                   `${prefix}countdown <Date/Time to countdown to>\n\n` +
                   `Examples:\n` +
                   `${prefix}countdown tomorrow 9 AM PDT\n` +
                   `${prefix}countdown May 24 3:47 PM IST` +
                   '```'
        },
        {
            name: 'Notes',
            value: 'A maximum of 3 countdowns can be set per server.\n' +
                   'To set a countdown, the user must have the `MANAGE_MESSAGES` permission.\n' +
                   'Report a bug or request a feature [here]'
        }
    )
    .setTimestamp()
    .setFooter('Live Countdown Bot');

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Customary bot check
    if (command === 'ping')
        return message.channel.send('PONG');

    // Display help message
    if (['help', 'commands', 'usage'].includes(command))
        return message.channel.send(helpEmbed);
    
    // Start a countdown
    if (command === 'countdown') {
        if (!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        
        const date = chrono.parseDate(args.join(" "));
        if(date)
            if(message.guild && message.guild.available) {
                if(!message.member.hasPermission('MANAGE_MESSAGES'))
                    return message.reply('You need to have the \`MANAGE_MESSAGES\` permission to set a countdown!');

                if(!Servers.hasOwnProperty(message.guild.id))
                    Servers[message.guild.id] = []

                let Messages = Servers[message.guild.id]

                let timeEnd = new Date(date);
                if(timeEnd < Date.now())
                    return message.reply(`ehh .. unless you have can warp time to go backwards, there's no way you can count back to \`${timeEnd.toUTCString()}\``);
                return message.channel.send(`Counting down to \`${timeEnd.toUTCString()}\``)
                    .then(replyMessage => Messages.unshift({message: replyMessage, timeThen: timeEnd}))
                    .catch(err => console.log(err || err.mesage));
            } else {
                return message.channel.send('The date/time is valid, but this bot can only be used in servers.');
            }
        else 
            return message.channel.send(`Invalid date/time.`)
    }
});

const updateCountdown = async () => {
    console.log(Servers);
    let timeNow = Date.now();
    for(const Messages of Object.values(Servers)) {
        let i = 0;
        while(i < Messages.length) {
            try {
                const { message, timeThen } = Messages[i];
                const timeLeft = timeThen - timeNow;

                if(i > 2) {
                    message.edit("Countdown aborted.");
                    Messages.length = 3;
                    break;
                }

                if(timeLeft <= 0) {
                    await message.edit("Countdown done.");
                    Messages.splice(i, 1);
                    continue;
                }
                await message.edit(`Time left: ${timeDiffForHumans(timeLeft)}.`);
                i++;
            } catch(ex) {
                Messages.splice(i, 1);
            }
        }
    }
    setTimeout(updateCountdown, updateInterval);
}

client.login(token);
