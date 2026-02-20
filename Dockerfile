# Stage 1: Build the React frontend
FROM node:22-alpine AS build

WORKDIR /app
COPY client ./client
WORKDIR /app/client
RUN npm ci
RUN npm run build

# Stage 2: Setup the Node backend
FROM node:22-alpine

WORKDIR /app

# Copy the backend code
COPY server ./server

# Copy the built frontend into the backend directory structure so Express can serve it
COPY --from=build /app/client/dist ./client/dist

# Install backend dependencies (production only to save space/time)
WORKDIR /app/server
RUN npm ci --production

# Expose port (Render overrides this with their own PORT, but good practice)
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
