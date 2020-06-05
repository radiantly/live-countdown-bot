FROM node:14.3.0-buster-slim

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV REDIS_HOST localhost

COPY package*.json ./

RUN npm ci

COPY modules ./modules
COPY index.js .

CMD ["node", "--experimental-json-modules", "index.js"]

USER node
