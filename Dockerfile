# Use an official Node.js LTS image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port your app uses (adjust if different)
EXPOSE 3001

# Start the app
CMD ["node", "index.js"]
