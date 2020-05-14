const Discord = require('discord.js');
const chrono = require('chrono-node');

const client = new Discord.Client();
const { prefix, token, updateInterval } = require('./config.json');
const timeDiffForHumans = require('./modules/timeDiffForHumans');

client.once('ready', () => {
	console.log('Bot initialized.');
});

const Messages = [];

const usage = `\`\`\`
!help - Shows this help message
!countdown - Counts down to a specific time given
E.g: !countdown tomorrow 9 AM IST
     !countdown May 24 3:47 PM GMT
\`\`\``

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping')
        return message.channel.send('PONG');
    if (['help', 'commands', 'usage'].includes(command))
        return message.channel.send(usage);
    if (command === 'countdown') {
        if (!args.length)
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        
        const date = chrono.parseDate(args.join(" "));
        if(date) 
            return message.channel.send(`Calculating time left.`)
                .then(replyMessage => Messages.push({message: replyMessage, timeThen: Date.parse(date)}))
                .catch(err => console.log(err || err.mesage));
        else 
            return message.channel.send(`Invalid date.`)
    }
});

setInterval(async () => {
    let i = 0;
    let timeNow = Date.now();
    while(i < Messages.length) {
        try {
            const { message, timeThen } = Messages[i];
            const timeLeft = timeThen - timeNow;
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
}, updateInterval);

client.login(token);
