FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p uploads/fotografii-santier generated-pdfs backups

RUN chmod -R 755 uploads generated-pdfs backups

EXPOSE 5000

CMD ["node", "server.js"]