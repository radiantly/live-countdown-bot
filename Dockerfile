FROM node:12-buster-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY modules ./modules
COPY index.js .

CMD ["node", "index.js"]

USER node
