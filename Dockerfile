
# Multi-stage build 

# build with node
FROM node AS builder

# set workspace
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./

# Copy TypeScript configuration files
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./

# Copy Vite build configuration
COPY vite.config.ts ./

# Build the application
RUN npm run build



###########


# Run with nginx
FROM nginx:1.28.0 AS final


# install tools
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*


# copy configurations nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

RUN mkdir -p /etc/nginx/ssl/
COPY ssl/ca-chain.cert.pem /etc/nginx/ssl/ca-chain.cert.pem
COPY ssl/server.key.pem /etc/nginx/ssl/server.key.pem
COPY ssl/ca-chain-verification.cert.pem /etc/nginx/ssl/ca-chain-verification.cert.pem

# export 9191 port
EXPOSE 9191

# check helth
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9191/ || exit 1
