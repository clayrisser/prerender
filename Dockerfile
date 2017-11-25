#############################################
# Dockerfile to run trailblazer
# Based on Ubuntu
#############################################

FROM node:8-slim

MAINTAINER Jam Risser (jamrizzi)

EXPOSE 8803

WORKDIR /app

ENV PORT=8803
ENV HOST=""
ENV TIMEOUT=500
ENV DEBUG=false

RUN apt-get update && apt-get install --no-install-recommends -y \
      git \
      gconf-service \
      libasound2 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgcc1 \
      libgconf-2-4 \
      libgdk-pixbuf2.0-0 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
      ca-certificates \
      fonts-liberation \
      libappindicator1 \
      libnss3 \
      lsb-release \
      xdg-utils \
      wget && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install --no-install-recommends -y \
      google-chrome-unstable && \
    wget -O /bin/tini https://github.com/krallin/tini/releases/download/v0.16.1/tini && \
    chmod +x /bin/tini && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get purge --auto-remove -y curl && \
    rm -rf /src/*.deb

COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install
COPY . /app
RUN npm prune --production

ENTRYPOINT ["/bin/tini", "--", "sh", "/app/startup.sh"]
