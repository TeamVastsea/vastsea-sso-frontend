FROM node:23-alpine AS builder
WORKDIR /app

COPY . .

ARG BASE_URL="/api"
ARG AUTH_SERVER_CLIENT_ID=""
ARG VITE_AUTH_SERVER_CLIENT_ID=""
ARG VITE_GT_ID=""

ENV BASE_URL=${BASE_URL}
ENV AUTH_SERVER_CLIENT_ID=${AUTH_SERVER_CLIENT_ID}
ENV VITE_AUTH_SERVER_CLIENT_ID=${VITE_AUTH_SERVER_CLIENT_ID}
ENV VITE_GT_ID=${VITE_GT_ID}

RUN npm i -g pnpm && \
    pnpm i --frozen-lockfile && \
    pnpm build

FROM nginx AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
