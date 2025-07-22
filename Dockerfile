FROM node:22-bookworm

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .env.production ./.env

RUN pnpm install --frozen-lockfile

COPY dist ./dist
COPY public ./public
COPY vite.config.ts ./

EXPOSE 3000

CMD ["pnpm", "start", "--port", "3000"]