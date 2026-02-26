FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server.js ./server.js
COPY roms ./roms

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
