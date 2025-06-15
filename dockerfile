FROM node:23-alpine

WORKDIR /app

ADD . .

ENV VITE_SSO_URL="http://main.vastsea.cc:8000"
ENV VITE_CLIENT_ID=""
ENV VITE_CALLBACK=""

RUN npm i -g pnpm && pnpm install --frozen-lockfile && pnpm build

FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html