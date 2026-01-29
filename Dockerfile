FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy server source
COPY server/ ./server/

# Build TypeScript
RUN cd server && npm run build

# Create temp directories inside server folder
RUN mkdir -p server/temp/uploads server/temp/output server/temp/assets server/fonts

EXPOSE 3000

# Start the server using the prefix
CMD ["npm", "--prefix", "server", "start"]
