# Use lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies statically
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY src/ ./src/

# Cloud Run defaults to port 8080
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD [ "node", "src/server.js" ]
