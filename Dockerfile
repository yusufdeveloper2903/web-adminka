FROM node:20-bookworm

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY .env.production ./.env

RUN yarn install --frozen-lockfile

COPY dist ./dist
COPY public ./public
COPY vite.config.ts ./

EXPOSE 5173

CMD ["yarn", "start", "--port", "5173"]