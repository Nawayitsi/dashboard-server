# Use Node.js base image
FROM node:20-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose server port
EXPOSE 4000

# Run migrations and start the backend service
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
