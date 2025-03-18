# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

COPY .env.production .env

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 4001

# Define the command to run the application
CMD ["npm", "run", "serve"]