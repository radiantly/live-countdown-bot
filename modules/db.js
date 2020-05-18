import Redis from 'ioredis';

const redis = new Redis();

const updateServerSet = async server => {
    const pendingMessages = await redis.llen(server);
    redis.zadd('Servers', pendingMessages, server);
}

export const addCountdown = async (message, timeEnd) => {
    if(!message?.id || !message.guild?.id || !message.channel?.id) return;
    const server = message.guild.id;
    await redis.lpush(server, JSON.stringify({messageId: message.id, channelId: message.channel.id, timeEnd: timeEnd }))
    await updateServerSet(server);
}

export const getMessages = async index => {
    const servers = await redis.zrangebyscore('Servers', index + 1, '+inf');
    const messages = []
    for(const server of servers) {
        const MessageString = await redis.lindex(server, index);
        if(MessageString)
            messages.push({ serverId: server, MessageString: MessageString });
        else
            await updateServerSet(server);
    }
    return messages;
}

export const removeMessage = async (server, value) => {
    redis.lrem(server, 0, value);
    updateServerSet(server);
}

export const log = async text => {
    const logText = `${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })} ${text}`;
    if(process.env.NODE_ENV !== 'production')
        console.log(logText)
    await redis.rpush('Logs', logText);
}

export const getLogs = async () => {
    return await redis.lrange('Logs', '-10', '-1');
}