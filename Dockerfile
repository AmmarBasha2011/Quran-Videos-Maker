# --- Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy root and server package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies
RUN npm install
RUN cd server && npm install

# Copy all source
COPY . .

# Build Frontend
RUN npm run build

# Build Backend
RUN cd server && npm run build


# --- Production Stage ---
FROM node:20-slim

# Install system dependencies (FFmpeg, Cairo, etc.)
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

# Copy package files for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/

# Install only production dependencies for the server
RUN cd server && npm install --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Create temp directories inside server folder
RUN mkdir -p server/temp/uploads server/temp/output server/temp/assets server/fonts

EXPOSE 3000

# Start command
CMD ["npm", "start"]
