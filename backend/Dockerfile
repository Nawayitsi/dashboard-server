# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY src ./src/
COPY prisma ./prisma/
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled code from Stage 1 builder
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/src ./src/

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/index.js"]
