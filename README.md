# Live Countdown bot
![Docker Image build](https://github.com/radiantly/live-countdown-bot/workflows/Docker%20image%20build/badge.svg)

A discord bot that counts down to a given time. What's the secret? It does this by continuously editing the message as each minute passes by.

#### Features:
  * Easy to use
  * Open-source
  * Author is a friendly guy
  * Only `SEND_MESSAGES` permission required
  * You probably can't live without it once you've used it

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

## Running locally

### 1. Using Docker

If you have `docker-compose` installed:
```sh
# Clone the repo
git clone https://github.com/radiantly/live-countdown-bot && cd live-countdown-bot

# Copy config.json.sample and add your bot token
cp config.json.sample config.json

docker-compose -f docker-stack.yml up
```
If running in production, you can use Docker Swarm mode.
```sh
# Create a config.json with your bot token
curl https://raw.githubusercontent.com/radiantly/live-countdown-bot/master/config.json.sample -o config.json
# vim config.json

# Download docker-stack.yml
curl https://raw.githubusercontent.com/radiantly/live-countdown-bot/master/docker-stack.yml -O

# If you have not pulled images from the GitHub Package registry before:
# cat ~/github_packages.token | docker login https://docker.pkg.github.com -u radiantly --password-stdin
# docker swarm init
docker stack deploy -c docker-stack.yml app --with-registry-auth
```
### 2. Without using docker
  * Step 1: Install Node v14 and Redis
  * Step 2: ???
  * Step 3: Clone this repo
  * Step 4: Add `config.json` with your bot token
  * Step 5: `npm i`
  * Step 6: `npm start`

Disclaimer: Author has not gone down this treacherous path.

## Contributing

Feel free to open an issue/pull request.
