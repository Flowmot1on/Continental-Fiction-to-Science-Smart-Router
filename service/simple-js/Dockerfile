FROM node:10.16-alpine

WORKDIR /app
ADD package.json .
ADD . .
ENTRYPOINT /usr/local/bin/node buyer.js
