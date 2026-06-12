# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build Vite application for production
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy default nginx configuration for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build outputs
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
