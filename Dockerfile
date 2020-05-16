FROM node:14.2.0-buster-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY modules ./modules
COPY index.js .

CMD ["node", "--experimental-json-modules", "index.js"]

USER node
