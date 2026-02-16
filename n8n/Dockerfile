FROM n8nio/n8n:1.90.2

USER root
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install puppeteer + stealth plugin to evade bot detection
RUN cd /usr/local/lib/node_modules/n8n && \
    npm install --omit=dev --no-audit --no-fund \
      puppeteer@24.2.0 \
      puppeteer-extra@3.3.6 \
      puppeteer-extra-plugin-stealth@2.11.2

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_FUNCTION_ALLOW_EXTERNAL=puppeteer,puppeteer-extra,puppeteer-extra-plugin-stealth
USER node
