FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
VOLUME /usr/src/app/storage
CMD ["npm", "start"]