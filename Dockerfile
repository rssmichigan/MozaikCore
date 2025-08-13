# Base image with Node.js
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies (prod only to keep image small)
RUN npm install --only=production

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the server
CMD ["node", "heartbeat.js"]
