# Build stage
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm start

# Production stage (serve with nginx)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (optional)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
