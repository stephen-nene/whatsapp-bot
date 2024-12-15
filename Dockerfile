FROM node:21-alpine3.18 as builder

WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm

ENV PNPM_HOME=/usr/local/bin

COPY . .

COPY package*.json *-lock.yaml ./

RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    && apk add --no-cache git \
    && pnpm install \
    && apk del .gyp

FROM node:21-alpine3.18 as deploy

WORKDIR /app

ARG PORT
ENV PORT $PORT
EXPOSE $PORT

COPY --from=builder /app ./
COPY --from=builder /app/*.json /app/*-lock.yaml ./

# Install pnpm again for the deploy stage
RUN npm install -g pnpm

ENV PNPM_HOME=/usr/local/bin

RUN npm cache clean --force && pnpm install --production --ignore-scripts \
    && addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs \
    && rm -rf $PNPM_HOME/.npm $PNPM_HOME/.node-gyp

CMD ["npm", "start"]
