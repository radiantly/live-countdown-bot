FROM node:14.4.0-buster-slim

WORKDIR /usr/src/app

ARG COMMIT_SHA=""
ARG REF="master"

ENV NODE_ENV production
ENV REDIS_HOST localhost
ENV COMMIT_SHA ${COMMIT_SHA}
ENV REF ${REF}

COPY package*.json ./

RUN npm ci

COPY modules ./modules
COPY index.js .

CMD ["node", "--experimental-json-modules", "index.js"]

USER node
