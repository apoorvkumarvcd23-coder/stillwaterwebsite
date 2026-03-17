FROM node:18-bullseye-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# Generate Prisma client (uses the schema to generate, no DB connection needed)
COPY prisma ./prisma
RUN npx prisma generate

COPY . ./

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
