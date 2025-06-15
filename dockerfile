FROM node:23-alpine

WORKDIR /app

ADD . .

ARG VITE_SSO_URL="http://main.vastsea.cc:8000"
ARG VITE_CALLBACK="864d56a1f2ffc85f9e94"
ARG VITE_CLIENT_ID="http://auth.vastsea.cc/callback"

ENV VITE_SSO_URL=${VITE_SSO_URL}
ENV VITE_CLIENT_ID=${VITE_CALLBACK}
ENV VITE_CALLBACK=${VITE_CLIENT_ID}

RUN npm i -g pnpm && pnpm install --frozen-lockfile && pnpm build

FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html