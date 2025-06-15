FROM node:23-alpine as builder

WORKDIR /app

ADD . .

ENV VITE_SSO_URL=http://main.vastsea.cc:8000
ENV VITE_CLIENT_ID=864d56a1f2ffc85f9e94
ENV VITE_CALLBACK=http://auth.vastsea.cc/callback

RUN npm i -g pnpm && pnpm install --frozen-lockfile && pnpm build

FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html