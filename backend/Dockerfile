# Node.js alap (könnyű verzió)
FROM node:20-alpine

# --- ÚJ RÉSZ: Chromium telepítése az Alpine Linuxhoz a Puppeteer miatt ---
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Megmondjuk a Puppeteernek, hogy ezt a böngészőt használja
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# --------------------------------------------------------------------------

# Munkamappa beállítása a konténeren belül
WORKDIR /app

# Függőségek másolása és telepítése
COPY package*.json ./
RUN npm install

# A teljes forráskód másolása
COPY . .

# Port megnyitása
EXPOSE 5000

# Indítás
CMD ["node", "server.js"]