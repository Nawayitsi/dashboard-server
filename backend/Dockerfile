# Use Node.js base image
FROM node:20-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy Prisma schema and generate client for target platform
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled JavaScript from runner
COPY dist ./dist/

# Expose server port
EXPOSE 4000

# Run migrations and start the backend service
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
