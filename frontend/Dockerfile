FROM node:20-slim

WORKDIR /app

# Copy package definition files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci || npm install

# Copy application files
COPY . .

# Set environment variables for Next.js container binding
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]
