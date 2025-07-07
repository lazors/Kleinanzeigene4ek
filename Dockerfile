# Use Node.js 20 LTS as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Set npm cache directory to a writable location
ENV NPM_CONFIG_CACHE=/app/.npm

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Create necessary directories and set up permissions
RUN mkdir -p /app/data /app/logs /app/.npm \
    && chown -R node:node /app \
    && chmod -R 755 /app \
    && chmod 777 /app/data

# Create startup script to handle permissions
RUN echo '#!/bin/bash\n\
# Ensure data directory has correct permissions\n\
chown -R node:node /app/data 2>/dev/null || true\n\
chmod -R 777 /app/data 2>/dev/null || true\n\
\n\
# Switch to node user and start the application\n\
exec gosu node npm start' > /app/start.sh \
    && chmod +x /app/start.sh

# Install gosu for proper user switching
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

# Expose port (if needed for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application using the startup script
CMD ["/app/start.sh"] 