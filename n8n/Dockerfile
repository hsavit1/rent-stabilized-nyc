FROM n8nio/n8n:1.90.2

# Install Chromium + Puppeteer for headless browser scraping (LeaseBreak)
USER root
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN cd /usr/local/lib/node_modules/n8n && npm install --omit=dev --no-audit --no-fund puppeteer@24.2.0

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_FUNCTION_ALLOW_EXTERNAL=puppeteer
USER node
