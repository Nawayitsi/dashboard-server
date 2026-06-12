FROM nginx:alpine

# Copy default nginx configuration for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-compiled static assets from build runner
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

