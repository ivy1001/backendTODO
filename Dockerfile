# Start from Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install OS dependencies needed for Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package.json and install all dependencies (including devDependencies like Nest CLI)
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the entire source code
COPY . .

# Build NestJS app
RUN npx nest build

# Copy wait-for and entrypoint scripts, make them executable
COPY wait-for.sh .
COPY entrypoint.sh .
RUN chmod +x wait-for.sh entrypoint.sh

# Set the startup command
CMD ["./entrypoint.sh"]
