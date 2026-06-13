FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY . .

RUN cd frontend && npm run build

EXPOSE 5000 3000

CMD ["node", "backend/server.js"]
