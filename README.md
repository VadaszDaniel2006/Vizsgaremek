# 🎬 MoziPont – Vizsgaremek

**Szoftverfejlesztő és -tesztelő záróvizsga remek** **Résztvevők:** Palkovics Tamás Tibor és Vadász Dániel

A MoziPont egy komplex, Full-Stack webalkalmazás, amely egyetlen letisztult felületen integrálja a globális filmes információszerzést és a lokális szolgáltatásokat (hazai moziműsorok és térkép), miközben erős, személyre szabott közösségi élményt nyújt.

---

## 📑 Tartalomjegyzék
1. [A projekt célkitűzése](#1-a-projekt-célkitűzése)
2. [Fő funkciók és modulok](#2-fő-funkciók-és-modulok)
3. [Technológiai Stack](#3-technológiai-stack)
4. [Csapatmunka és Feladatkörök](#4-csapatmunka-és-feladatkörök)
5. [Adatbázis architektúra](#5-adatbázis-architektúra)
6. [Szoftvertesztelés (QA)](#6-szoftvertesztelés-qa)
7. [Fejlesztési eszközök](#7-fejlesztési-eszközök)
8. [Környezet és Futtatás](#8-környezet-és-futtatás)

---

## 1. A projekt célkitűzése
A téma kiválasztását a közös érdeklődési körünk inspirálta. A jelenlegi filmes portálok (pl. IMDb, Port.hu) használata során számos felhasználói fájdalompontot azonosítottunk: töredezett információk, elavult felületek és a személyre szabhatóság hiánya.

Célunk egy olyan modern, Single Page Application (SPA) alapú platform megalkotása volt, amely megoldást kínál ezekre a problémákra. A MoziPont nem csupán informál, hanem intelligens ajánlórendszerével segít a tartalomfelfedezésben, miközben a hazai mozik vetítési időpontjait is naprakészen tartja.

## 2. Fő funkciók és modulok
* **Személyre szabott élmény:** Intelligens ajánlórendszer, amely a felhasználó által kedvelt kategóriák (pl. Sci-Fi, Thriller) alapján súlyozza a kezdőoldali tartalmakat.
* **Közösségi interakciók:** Valós idejű, 1-10 közötti értékelési rendszer és szöveges vélemények írása. Az átlagpontszámokat a rendszer azonnal, triggerelés nélkül újraszámolja.
* **Interaktív Mozitérkép (Geolokáció):** A hazai mozik (Cinema City, Kultik, Art mozik) vizuális megjelenítése a térképen, pontos vetítési időpontokkal integrálva.
* **Saját gyűjtemények:** "Saját lista" funkció a jövőben megtekinteni kívánt tartalmak mentésére.
* **Automatizált adatgyűjtés (Web Scraper):** Háttérben futó, ütemezett robot, amely külső szolgáltatóktól nyeri ki és frissíti a moziműsorokat.
* **Robusztus Admin Vezérlőpult:** Szerepkör-alapú (RBAC) hozzáférés a tartalmak kezeléséhez (CRUD), a felhasználók menedzseléséhez, a moderációhoz (jelentett kommentek) és a hibajegyek (ticketek) kezeléséhez.

## 3. Technológiai Stack
A rendszert szigorúan rétegezett, mikro-szolgáltatás (microservices) szemléletű architektúrában építettük fel.

**Frontend (Kliensoldal):**
* React.js (Vite környezetben)
* CSS Grid / Flexbox (egyedi, reszponzív dizájn) & Material UI (komponensekhez)
* Leaflet.js (Interaktív térkép modul)
* Context API (Állapotkezelés)

**Backend (Szerveroldal):**
* Node.js & Express.js (RESTful API, MVC minta alapján)
* JWT (JSON Web Token) & Bcrypt (Autentikáció és Kriptográfia)
* Puppeteer & Cheerio (Automatizált Web Scraping)
* Node-cron (Feladatok ütemezése)

**Adatbázis & Infrastruktúra:**
* MySQL (Mélyen normalizált relációs adatbázis)
* Docker & Docker Compose (Konténerizáció)

## 4. Csapatmunka és Feladatkörök
A fejlesztés során az Agilis módszertant követtük, heti sprintekkel és folyamatos integrációval (CI). A komplexebb moduloknál páros programozást (pair programming) alkalmaztunk. Mindkét csapattag Full-Stack szemléletben dolgozott.

### Vadász Dániel
* **Rendszerarchitektúra & Biztonság:** RESTful API váz megtervezése, JWT/Bcrypt alapú autentikáció implementálása.
* **Core Logika & Scraper:** A cinemaScraper.js adatbányász robot és a keresőmotor aszinkron logikájának fejlesztése.
* **Frontend State Management:** A React környezet felállítása, globális állapotkezelés, kliensoldali útválasztás.
* **QA:** End-to-End (E2E) automatizált tesztelés kiépítése Selenium Webdriver segítségével.

### Palkovics Tamás Tibor
* **Adatbázis & Relációk:** A MySQL ER diagram megtervezése, az adatbázis normalizációja.
* **Közösségi motor & UI:** Az értékelési/moderációs rendszer végpontjainak megírása, a felhasználói felület (Hero slider, profil) kialakítása.
* **Admin & Geolokáció:** Az adminisztrációs vezérlőpult teljes körű fejlesztése és a Leaflet.js mozitérkép integrációja.
* **QA:** Szerveroldali automatizált egységtesztek írása Jest keretrendszerrel.

## 5. Adatbázis architektúra
A rendszer alapját egy 3NF (Harmadik Normálforma) szabályai szerint optimalizált, 16 táblából álló MySQL adatbázis adja. A tervezés két fő logikai blokkra oszlik:

* **Felhasználók és Interakciók:** Felhasználói adatok, hash-elt jelszavak, jogosultságok, értékelések, saját listák és személyes kategória-preferenciák N:M kapcsolatokkal.
* **Média és Mozik:** Filmek/sorozatok közös media entitásban való tárolása, műfajok, streaming platformok, és a mozik vetítési időpontjai (időbeli és térbeli koordinátákkal).

## 6. Szoftvertesztelés (QA)
A magas fokú rendelkezésre állás és hibamentes élmény érdekében többlépcsős tesztelést alkalmaztunk:

* **Manuális API tesztelés:** Postman segítségével a végpontok és a middleware-ek (pl. jogosultság-ellenőrzés) validálása.
* **Backend Egységtesztelés (Unit Tests):** A kritikus üzleti logikák (pl. authController hibakezelése) automatizált ellenőrzése Jest segítségével, mockolt adatbázis kapcsolatokkal.
* **Frontend End-to-End Tesztelés (E2E):** Selenium Webdriver alapú, automatizált UI tesztek. 30 darab teszteset szimulálja a felhasználói interakciókat (regisztráció, navigáció, admin funkciók, térkép betöltés) Google Chrome környezetben.

## 7. Fejlesztési eszközök
* **Tervezés & Dizájn:** Figma, Canva, Inkscape
* **Kódolás & Verziókövetés:** Visual Studio Code, Git & GitHub
* **Adatbázis & DevOps:** Docker Desktop, phpMyAdmin
* **Projektmenedzsment:** Vtk Moodle, Discord, Google Drive, Microsoft Office

## 8. Környezet és Futtatás
A platform telepítésének és futtatásának leegyszerűsítésére a teljes architektúrát Docker konténerekbe csomagoltuk. Az érzékeny adatokat a biztonsági standardoknak megfelelően lokális `.env` fájl kezeli.

**A rendszer indítása:** A gyökérkönyvtárban elhelyezett saját inicializáló szkriptünk (`indito.js`) egyetlen paranccsal elindítja a teljes rendszert (ellenőrzi a hálózatot, felhúzza az adatbázist, majd az API-t és a klienst):

```bash
node indito.js
