# Live Countdown bot

[![Invite me](https://img.shields.io/static/v1?style=flat&logo=discord&logoColor=FFF&label=&message=invite%20me&color=7289DA)](https://discord.com/api/oauth2/authorize?client_id=710486805836988507&permissions=2048&scope=bot)
[![Bot status](https://top.gg/api/widget/status/710486805836988507.svg?noavatar=true)](https://top.gg/bot/710486805836988507)
[![Tests](https://github.com/radiantly/live-countdown-bot/workflows/Tests/badge.svg)](https://github.com/radiantly/live-countdown-bot/actions?query=workflow%3A%22Tests%22)
[![Code quality](https://img.shields.io/badge/Quality-Ninja-critical)](https://javascript.info/ninja-code)
[![Code style](https://img.shields.io/badge/Style-Prettier-ff69b4)](https://github.com/prettier/prettier)
[![Server count](https://top.gg/api/widget/servers/710486805836988507.svg?noavatar=true)](https://top.gg/bot/710486805836988507)

A discord bot that counts down to a given time. What's the secret? It does this by continuously editing the message as each minute passes by.

#### Features:

- Easy to use
- Open-source
- Author is a friendly guy
- Countdown to events on your Discord server
- You probably can't live without it once you've used it

### Usage

#### `!help`

Shows the help message.

#### `!botstats`

Shows some bot statistics including uptime and software versions.

#### `!countdown`

Syntax: `!countdown [tagme|taghere|tageveryone] <Date/time to countdown to>`

Commands can also be inlined, by wrapping it between two exclamation marks.

Syntax: `.. !!countdown [tagme|taghere|tageveryone] <Date/time to countdown to>! ..`

Examples:

```
!countdown 10mins
!countdown tagme May 24 3:47 PM PDT

Time till I'm 13 yrs old: !!countdown Aug 31, 10PM GMT! left.
There is !!countdown taghere 11:59 PM EST! left to capture flags!
```

## Contributing

Feel free to open an issue/pull request. You may find the [Architecture.md](./Architecture.md) document helpful to find what you're looking for.
