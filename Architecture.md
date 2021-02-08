# Architechture.md

Execution starts at [`index.js`](./index.js). This is the shard manager and starts multiple instances of [`bot.js`](./modules/bot.js). Around 1 instance is started per 1000 guilds.

From [`bot.js`](./modules/bot.js),

- Messages are handled by [`messageHandler.js`](./modules/messageHandler.js).
- Embed structures including for `!help` and `!botstats` can be found in [`embed.js`](./modules/embed.js).
- Helper functions that parse the countdown command can be found in [`countdownHelper.js`](./modules/countdownHelper.js).
- To update countdowns, [`updateManager.js`](./modules/updateManager.js) is used.
- Translations to other languages can be found in [`lang.js`](./modules/lang.js). Feel free to add your language here.
- Sending server counts to bot lists is handled by [`post.js`](./modules/post.js).
