import Redis from "ioredis";
import { env, exit } from "process";

const redis_options = {};

if (env.REDIS_HOST) redis_options.host = env.REDIS_HOST;

export const redis = new Redis(redis_options);

// Catch errors
redis.on("error", err => log(err));

// Give redis some time to start up
setTimeout(() => redis.on("error", () => exit(63)), 10000);

export const getCountdownLen = async server => await redis.llen(server);
const updateServerSet = async (server, pendingMessages) => {
  if (!pendingMessages) pendingMessages = await redis.llen(server);
  redis.zadd("Servers", pendingMessages, server);
};

export const addCountdown = async (server, MessageObj, priority) => {
  try {
    if (priority) await redis.lpush(server, JSON.stringify(MessageObj));
    else await redis.rpush(server, JSON.stringify(MessageObj));
    await updateServerSet(server);
  } catch (ex) {
    log(ex);
  }
};

export async function* getMessages(index) {
  const servers = await redis.zrangebyscore("Servers", index + 1, "+inf");
  for (const server of servers) {
    const MessageString = await redis.lindex(server, index);
    if (MessageString) yield { serverId: server, MessageString: MessageString };
    else await updateServerSet(server);
  }
}

export const removeMessage = async (server, value) => {
  try {
    await redis.lrem(server, 0, value);
    await updateServerSet(server);
  } catch (ex) {
    log(ex);
  }
};

export const trimMessages = async index => {
  const servers = await redis.zrangebyscore("Servers", index + 1, "+inf");
  for (const server of servers) {
    await redis.ltrim(server, 0, index - 1);
    updateServerSet(server, index);
  }
};

export const removeCountdowns = async server => {
  return (await redis.zrem("Servers", server))
    ? (await redis.del(server))
      ? `${server} has been deleted and removed from Set.`
      : `${server} deleted from Set, but no list found.`
    : `Server "${server}" not found.`;
};

export const getTotalCountdowns = async () => await redis.zcount("Servers", "1", "+inf");

export const getRedisInfo = async () => {
  const info = await redis.info();
  const version = info.match(/redis_version:(.*)/);
  const mem = info.match(/used_memory_rss_human:(.*)/);
  return {
    redisVersion: version?.length === 2 ? version[1] : "???",
    redisMemUsage: mem?.length === 2 ? mem[1] : "???",
  };
};

export const log = async text => {
  try {
    const logText = `${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })} ${text}`;
    console.log(logText);
    if (redis.status === "ready") await redis.rpush("Logs", logText);
  } catch {}
};

export const getLogs = async () => {
  return await redis.lrange("Logs", "-20", "-1");
};
