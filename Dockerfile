# Dockerfile

# Stage 1: Build the application
FROM node:20 AS builder

# Install Bun
RUN npm install -g bun@1.1.9

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb (if available)
COPY package.json bun.lockb ./ 

# Install dependencies using Bun
RUN bun install

# Copy the rest of your application code
COPY . .

# Build the Next.js application using Bun
RUN bun run build

# Stage 2: Serve the application
FROM node:20

# Install Bun
RUN npm install -g bun@1.1.9

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install only production dependencies using Bun
RUN bun install --production

# Copy the build output and necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/config.toml ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/src/app/v1 /app/src/app/v1
RUN find /app/src/app/v1 -type f ! -name "*.md" ! -name "*.ts" -delete

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["bun", "run", "start", "-H", "0.0.0.0", "-p", "3000"]
