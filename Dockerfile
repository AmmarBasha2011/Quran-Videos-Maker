
FROM node:20-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy all files
COPY . .

# Install server dependencies
RUN cd server && npm install

# Build the frontend
RUN npm run build

# Cleanup to reduce image size
RUN rm -rf node_modules

EXPOSE 3000

# Start the server using node directly to avoid npm overhead
CMD ["node", "server/index.js"]
