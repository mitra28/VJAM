FROM node:18

# Create app directory
WORKDIR /Users/developer/Desktop/VJAM/VJAM/website

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .
RUN npm run setup

EXPOSE 8080
CMD [ "node", "server.js" ]
