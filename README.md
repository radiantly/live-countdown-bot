# live-countdown-bot
![Docker Image build](https://github.com/radiantly/live-countdown-bot/workflows/Docker%20image%20build/badge.svg)

A discord bot that counts down to a given time.

### Installation

To run, you will need Node v14.
```sh
git clone https://github.com/radiantly/live-countdown-bot

# You will need a `config.json` file with your desired prefix and bot token.
npm install
npm start
```

This project is also packaged as a Docker image. You can either clone and build the image yourself, or pull the built image from GitHub packages. If you have not pulled images from the GitHub Package registry before, you will need to follow the instructions [here](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-docker-for-use-with-github-packages) to configure docker.
```sh
docker pull docker.pkg.github.com/radiantly/live-countdown-bot/lcb:latest

docker run -d \
--rm \
--name lcb \
--mount type=bind,source="$(pwd)/config.json",target=/usr/src/app/config.json \
docker.pkg.github.com/radiantly/live-countdown-bot/lcb:latest
```