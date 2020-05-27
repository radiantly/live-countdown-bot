FROM node:14.3.0-buster-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY modules ./modules
COPY index.js .

ENV NODE_ENV production
ENV REDIS_HOST localhost

CMD ["node", "--experimental-json-modules", "index.js"]

USER node
