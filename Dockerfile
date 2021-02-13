FROM node:fermium-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

COPY .git ./.git

RUN yarn

COPY . .

RUN yarn tsc

EXPOSE 52021

CMD ["node", "./dist/index.js"]

