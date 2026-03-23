# Vizsgaremek – Mozis filmek és sorozatok webalkalmazása

**Projekt neve:** Mozipont  
**Résztvevők:** Palkovics Tamás Tibor és Vadász Dániel  

---

## Tartalomjegyzék
1. [Vizsgaremek célkitűzése](#1-vizsgaremek-célkitűzése)
2. [Feladat leírása és bemutatása](#2-feladat-leírása-és-bemutatása)
3. [A fejlesztés menete és a projekt háttere](#3-a-fejlesztés-menete-és-a-projekt-háttere)
4. [Tervezett vállalásaink és feladatkörök](#4-tervezett-vállalásaink-és-feladatkörök)
   - [Vadász Dániel – Frontend és Backend fejlesztés](#vadász-dániel--frontend-és-backend-fejlesztés)
   - [Palkovics Tamás Tibor – Frontend és Backend fejlesztés](#palkovics-tamás-tibor--frontend-és-backend-fejlesztés)
5. [Közös munkafolyamatok](#5-közös-munkafolyamatok)
6. [Felhasznált programok és eszközök](#6-felhasznált-programok-és-eszközök)
7. [Fejlesztési környezet](#7-fejlesztési-környezet)

---

## 1. Vizsgaremek célkitűzése

Mozis filmek és sorozatok bemutatására, véleményezésére és a felhasználói ízlés alapján történő ajánlására szolgáló komplex webes alkalmazás (Mozipont) készítése. 

A téma kiválasztását elsősorban a közös érdeklődési körünk inspirálta, hiszen mindketten szívesen töltjük a szabadidőnket a filmek és sorozatok világában. Célunk egy olyan átlátható felület létrehozása volt, amely nemcsak informál, hanem segíti is a felhasználókat a tájékozódásban.

---

## 2. Feladat leírása és bemutatása

Az alkalmazás segítségével a látogatók részletes leírásokat olvashatnak a különböző művekről, megtekinthetik az előzeteseket (trailereket), és hatékonyan kereshetnek a filmek és sorozatok között. Emellett saját listát készíthetnek, és elmenthetik a kedvenceiket. A platformon helyet kaptak heti ajánlók, egy „Top 50” film és sorozat oldal, valamint egy interaktív mozitérkép is, amely megmutatja a hazai filmszínházak elhelyezkedését. 

A fejlesztés megkezdésekor fontosnak tartottuk, hogy a piacon lévő megoldásokhoz képest valami pluszt nyújtsunk. Hiányoltuk azokat az alkalmazásokat, amelyek egyszerre kezelik az információszerzést és a személyre szabott igényeket. Rendszerünk egyik legfontosabb újítása, hogy a felhasználók által kedvelt kategóriák alapján képes személyre szabott ajánlásokat kínálni. Ezáltal mindenki könnyebben fedezhet fel olyan műveket, amelyek valóban illeszkednek az ízléséhez.

Összességében a projekt nem csupán a technikai tudásunkat demonstrálja, hanem a mozgóképkultúra iránti elkötelezettségünket is. Bízunk benne, hogy webalkalmazásunk a jövőben hasznos eszközzé válik a kikapcsolódni vágyók számára, és hozzájárul a filmes közösségi élet élénkítéséhez.

---

## 3. A fejlesztés menete és a projekt háttere

A projekt megvalósítását a szoros és összehangolt csapatmunka alapozta meg. A feladatok – beleértve a felhasználói felület és a szerveroldali logika fejlesztését – tudatos megosztása lehetővé tette az erőforrások optimális kihasználását. A rendszeres konzultációk és a közös problémamegoldás révén hatékonyan kezeltük az akadályokat, miközben mindkét területen jelentős új tapasztalatokkal gazdagodtunk.

A fejlesztés ideje alatt a kommunikációs készségeink és az empatikus hozzáállásunk is sokat fejlődött. Megtanultuk, hogy a nyílt párbeszéd és a konstruktív visszajelzés elengedhetetlen a minőségi munkavégzéshez. 

Az időmenedzsment terén a szigorú tervezést és a határidők következetes betartását tartottuk szem előtt. A részletes ütemterv segített abban, hogy elkerüljük a vizsgaidőszak végi kapkodást, és minden fejlesztési fázist nyugodt körülmények között zárhassunk le. Szervezettségünknek köszönhetően minden funkciót időben sikerült implementálnunk. Ebben nagy segítségünkre volt egy Gantt-diagram, amelynek segítségével előre meg tudtuk tervezni a különböző munkafolyamatok időigényét.

---

## 4. Tervezett vállalásaink és feladatkörök

A fejlesztés során mindkét csapattag Full-stack (Frontend és Backend) feladatokat látott el, hogy a rendszer architektúrájának minden rétegét átlássuk és közösen fejlesszük.

### Vadász Dániel – Frontend és Backend fejlesztés
* **Node.js + Express.js alapok és API végpontok felépítése:** A szerveroldali alaparchitektúra és a routing (útválasztás) kialakítása, hogy az API gyors, megbízható és bővíthető legyen.
* **Felhasználói autentikáció és biztonság (Backend):** A biztonságos bejelentkezési és regisztrációs rendszer logikájának megírása JWT (JSON Web Token) technológia használatával.
* **Adatbázis műveletek (Backend):** A filmek, sorozatok és felhasználók alapvető adatainak rögzítése, módosítása és lekérdezése a MySQL adatbázisban.
* **Kezdőoldal és Heti ajánló UI (Frontend):** A főoldal felületének elkészítése, beleértve a random filmek és a kategória alapú "Heti ajánlók" megjelenítését a felhasználók számára.
* **Kereső modul felülete és logikája (Frontend & Backend):** A keresési funkciók végpontjainak megvalósítása a szerveren, valamint a keresőmező és az eredmények dinamikus megjelenítése a felhasználói felületen.
* **Jegyfoglalási UI (Frontend):** A jegyfoglalási folyamat felhasználói felületének, többek között az interaktív ülésválasztó (széktérkép) vizuális kialakítása.

### Palkovics Tamás Tibor – Frontend és Backend fejlesztés
* **Mozik és vetítések kezelése (Backend):** A moziműsorok, vetítési időpontok és a mozik adatainak lekérdezéséhez szükséges szerveroldali logika és API végpontok fejlesztése.
* **Interaktív mozitérkép és közelség (Frontend):** A hazai mozik elhelyezkedésének vizuális megjelenítése térképen, illetve a felhasználóhoz közeli mozik listázásának frontend integrációja.
* **Személyre szabott ajánlások és Top listák (Backend & Frontend):** A felhasználói preferenciák alapján történő filmajánló logika kidolgozása, valamint a "Top 50 / Top 100" filmek lekérdezése és a felületen történő esztétikus megjelenítése.
* **Értékelések és vélemények kezelése (Backend & Frontend):** A filmekhez tartozó felhasználói vélemények elmentésének logikája, és az értékelések frissítésének frontend implementációja.
* **Adminisztrációs felület (Frontend & Backend):** Az admin vezérlőpult funkcióinak bővítése (filmek/sorozatok adatainak frissítése, adatbázis karbantartása, feltöltések), és a hozzá tartozó jogosultságkezelés.
* **Foglalási visszaigazolások (Backend & Frontend):** A sikeres jegyfoglalás utáni háttérfolyamatok lekezelése, és a részletes visszaigazolások megjelenítése a felhasználónak.

---

## 5. Közös munkafolyamatok

* **Adatbázis vázának megtervezése:** Közös munka a MySQL adatbázis struktúrájának és a táblák kapcsolatainak (relációinak) megtervezésében, a hatékony adattárolás érdekében.
* **REST API specifikáció kialakítása:** A kommunikációs csatornák, végpontok és adatszerkezetek közös definiálása a frontend és a backend zökkenőmentes együttműködéséhez.
* **Tesztek írása (Jest) és hibajavítás:** A rendszer kritikus funkcióinak közös tesztelése, a felmerülő hibák (bugok) elhárítása és a felhasználói élmény finomhangolása.

---

## 6. Felhasznált programok és eszközök

* **Microsoft Office (Word, PowerPoint):** A Word programot a projekt teljes dokumentációjának elkészítésére használtuk, a PowerPoint segítségével pedig a vizsgaremek bemutatása készült el.
* **Figma:** A webalkalmazás felhasználói felületének megtervezésére, a vázlatok és vizuális elrendezések elkészítésére.
* **Canva & Inkscape:** A Canva-t az oldal logójának gyors elkészítésére, míg az Inkscape-t a vektorgrafikus vizuális elemek finomítására alkalmaztuk.
* **Google Drive:** A nagyobb méretű fájlok megosztására és biztonságos tárolására a projekt kezdeti szakaszában.
* **Vtk Moodle:** A projekt különböző szakaszait és mérföldköveit ide töltöttük fel a folyamatos tanári nyomon követés érdekében.
* **Messenger & Discord:** Gyors egyeztetésekre, valamint összetettebb problémák közös megbeszélésére, képernyőmegosztásra és közös kódolásra használtuk.
* **GitHub:** A projekt teljes forráskódjának folyamatos feltöltésére, tárolására és verziókövetésére.
* **Visual Studio Code:** A projekt teljes forráskódját ebben a fejlesztőkörnyezetben készítettük el.
* **Docker Desktop:** Segítségével az adatbázist konténerizált környezetben futtattuk, biztosítva az azonos fejlesztői környezetet.
* **Postman:** A backend végpontok tesztelésére és ellenőrzésére.
* **Material UI:** A komponensgyűjteményt az egységes, modern felhasználói felület kialakításához alkalmaztuk.

---

## 7. Fejlesztési környezet

**Frontend:**
* HTML, CSS, JavaScript
* React
* Geolocation API
* Material UI

**Backend:**
* Node.js
* Express.js
* REST API architektúra
* JWT (JSON Web Token) alapú autentikáció

**Külső API-k:**
* **YouTube Data API:** Trailerek és videó metaadatok lekéréséhez.
* **TMDb API:** Plakátok, leírások, képek és részletes filmes adatok integrálásához.

**Adatbázis:**
* **MySQL:** Mozik, vetítések, foglalások, felhasználók, értékelések és kedvencek relációs tárolása (Docker konténerben futtatva).

**A fejlesztési környezet futtatásához szükséges fájlok azonnali letöltése:**
*(A linkekre kattintva a böngésző azonnal letölti a fájlokat a gépedre.)*

* 🐳 [**docker-compose.yml letöltése**](https://drive.google.com/uc?export=download&id=17gjd4pBreps4Ub8ZaHBggPk1N51rWaes) 
* 💾 [**mozipont_beta.sql adatbázis letöltése**](https://drive.google.com/uc?export=download&id=1vdqx9FhWL1gBA8rsxt-ZEDJ5lDAL0iO4)
