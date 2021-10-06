FROM node:14 AS base

RUN npm config set cache /home/node/app/.npm-cache --global

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
ENV PATH /app/node_modules/.bin:$PATH

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENV PORT 80
EXPOSE 80
CMD [ "npm", "run", "start" ]