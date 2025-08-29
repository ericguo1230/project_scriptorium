FROM node:18-slim
WORKDIR /app

# Install TypeScript and ts-node globally
RUN npm install -g typescript@latest ts-node@latest

USER nobody