FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate

EXPOSE 5050

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && npm start"]