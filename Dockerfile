FROM node:latest
WORKDIR /app
COPY ./package.json ./
COPY .env ./
COPY tsconfig.json ./
RUN npm i --legacy-peer-deps
COPY . .
CMD ["npm", "run", "dev"]