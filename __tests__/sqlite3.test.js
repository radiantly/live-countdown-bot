// import { db, initGuilds, addGuild } from "../modules/writeSqlite3.js";
// import { Client, Guild, Collection } from "discord.js";
// import { getPrefix, setPrefix } from "../modules/prefixHandler.js";

describe.skip("test db functions", () => {
  const client = new Client();
  const guildCache = new Collection();

  for (let i = 1; i <= 1000; i++) {
    const randomSnowflake = `${Math.floor(Math.random() * 1e18)}`;
    guildCache.set(randomSnowflake, new Guild(client, { id: randomSnowflake }));
  }

  const testGuild = new Guild(client, { id: "719541990580289557" });
  const testGuild2 = new Guild(client, { id: "703884760531075183" });

  guildCache.set(testGuild.id, testGuild);

  test("basic initialization of guilds", () => {
    initGuilds(guildCache, 1);
    expect(db.prepare("SELECT COUNT(*) FROM GuildInfo").raw().get()).toEqual([guildCache.size]);
  });

  test("add additional guilds", () => {
    initGuilds(
      new Collection([
        [testGuild.id, testGuild],
        [testGuild2.id, testGuild2],
      ]),
      2
    );
    expect(db.prepare("SELECT COUNT(*) FROM GuildInfo").raw().get()).toEqual([guildCache.size + 1]);
  });

  test("shard update", () => {
    expect(db.prepare("SELECT Guild FROM GuildInfo WHERE Client = 2").raw().all().sort()).toEqual(
      [["719541990580289557"], ["703884760531075183"]].sort()
    );
  });

  // Test prefixHandler.js
  // TODO: Move to own test file once
  // https://github.com/JoshuaWise/better-sqlite3/issues/414 is resolved

  db.prepare("DELETE FROM GuildInfo").run();

  test("null conditions", () => {
    expect(getPrefix(testGuild)).toBe("!");
    expect(setPrefix(testGuild, "4")).toBeUndefined();
  });

  addGuild(testGuild.id, "0");

  test("normal working", () => {
    expect(getPrefix(testGuild)).toBe("4");
    expect(setPrefix(testGuild, "gad")).toBeUndefined();
    expect(getPrefix(testGuild)).toBe("gad");
  });

  afterAll(() => {
    db.close();
    client.destroy();
  });
});
