FROM node:14.18.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apk add vim curl bash

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3001

ENV NODE_ENV PROD
ENV DB_SERVER=mongo_db
ENV DB_USER=root
ENV DB_PASS=root
# ENTRYPOINT [ "node", "-r", "dotenv/config server.js" ]
CMD [ "node", "server.js" ]