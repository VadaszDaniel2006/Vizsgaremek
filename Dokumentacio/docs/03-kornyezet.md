---
id: kornyezet
sidebar_position: 3
title: Környezet és Futtatás
---

# Rendszerkörnyezet, Konténerizáció és Telepítés

A modern webfejlesztés egyik legnagyobb kihívása a "nálam működik" (it works on my machine) probléma elkerülése. Ennek kiküszöbölésére a MoziPont teljes architektúráját (Adatbázis, Backend API, Frontend kliens) **Docker** konténerekbe csomagoltuk. Ez a mikroszolgáltatás (microservices) szemléletű megközelítés garantálja a maximális hordozhatóságot, a skálázhatóságot és az elszigetelt (izolált) futtatási környezetet.

## A Docker Architektúra Felépítése

A projekt három fő konténerből áll, amelyek egy közös, belső Docker hálózaton (bridge network) kommunikálnak egymással, így a külvilág felé csak a feltétlenül szükséges portokat (pl. 3000, 5000, 8082) nyitják meg.
1. **MySQL Konténer:** Az adatbázis szerver, amely egy dedikált volumenhez (Docker Volume) van csatolva, így az adatok a konténer újraindítása vagy megsemmisülése esetén is perzisztensek (maradandóak) lesznek.
2. **Node.js Backend Konténer:** A szerveroldali logika. A hozzá tartozó `Dockerfile` egy rendkívül könnyűsúlyú `node:alpine` Linux képre (image) épül. Különlegessége, hogy a konténer építésekor (build) automatikusan telepíti a Chromium böngészőmotor Linuxos függőségeit is, amely elengedhetetlen a Puppeteer alapú mozi adatgyűjtő robotunk stabil működéséhez.
3. **React Frontend Konténer:** A felhasználói felület kiszolgálásáért felelős egység.

## A Rendszer Automatizált Elindítása (`indito.js`)

A rendszer üzembe helyezésének leegyszerűsítése érdekében megírtunk egy saját inicializáló szkriptet (`indito.js`). Ez egyetlen parancs kiadásával végigviszi a teljes telepítési és indítási folyamatot:
1. Megnyitunk egy parancssort a projekt gyökérkönyvtárában.
2. Megbizonyosodunk róla, hogy a Docker Engine fut a gazdagépen.
3. Kiadjuk a `node indito.js` parancsot.

A szkript ellenőrzi a hálózatot, felhúzza az adatbázist, majd elindítja az API-t. Amikor a terminálban megjelenik a zöld megerősítő üzenet, a rendszer készen áll a felhasználók kiszolgálására.

![Sikeres rendszerindítás a terminálban](/img/rendszer-indulas.png)

A vizuális ellenőrzés érdekében a Docker Desktop alkalmazásában is láthatóvá válik a projekt konténereinek állapota és erőforrás-használata.

![Futó konténerek a Docker Desktopban](/img/docker-desktop.png)

## Biztonság és Környezeti Változók (.env)

A szoftverfejlesztés biztonsági alapelvei (pl. OWASP) szerint a hitelesítő adatokat soha nem szabad a forráskódba égetni (hardcode). Ezt a problémát a `.env` fájlok alkalmazásával oldottuk meg. 

A `.env` fájl tartalmazza azokat az érzékeny konfigurációkat, amelyeket a verziókövető rendszer (Git) figyelmen kívül hagy (`.gitignore`):
* **DB_HOST, DB_USER, DB_PASSWORD:** Az adatbázis kapcsolati adatai.
* **JWT_SECRET:** A JSON Web Tokenek aláírásához használt, egyedi kriptográfiai kulcs.
* **EMAIL_USER, EMAIL_PASS:** A Nodemailer által használt SMTP szerver (Gmail) hitelesítő adatai az elfelejtett jelszó funkcióhoz.

## Biztonsági Mentés (Database Dump) és Leállítás

A platform biztonságos leállításához a terminálban a `Ctrl + C` billentyűkombinációt kell alkalmazni. Az indító szkriptünk azonban ezt a jelet (SIGINT) elfogja, és mielőtt leállítaná a Docker konténereket, egy automatizált adatbázis mentési folyamatot indít el. 
A háttérben lefutó `mysqldump` parancs a teljes adatbázis struktúráját és az összes meglévő adatot (felhasználók, értékelések, tartalmak) egy `mozipont_beta.sql` nevű fájlba exportálja. Ez a robusztus megoldás garantálja, hogy áramszünet, szerverhiba vagy manuális leállítás esetén egyetlen bájtnyi felhasználói adat sem vész el.