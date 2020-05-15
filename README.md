# live-countdown-bot
A discord bot that counts down to a given time.

## Installation
To run,
```sh
npm install
node index.js
```

This project is also packaged as a Docker image. To build and run, use the following commands:
```sh
docker image build -t lcb .
docker run -d --name lcb --mount type=bind,source="$(pwd)/config.json",target=/usr/src/app/config.json --rm lcb
```