---
id: tech-dokumentacio
sidebar_position: 4
title: Technológiai Áttekintés
---

# Technológiai Áttekintés és Rendszerarchitektúra

A MoziPont platform fejlesztése során nem csupán egy működő prototípus, hanem egy hosszú távon is karbantartható, skálázható és iparági standardoknak megfelelő szoftver létrehozása volt a cél. Ennek érdekében a rendszert egy modern **MVC (Model-View-Controller)** alapú, szigorúan rétegezett architektúrára bontottuk.

Ez a dokumentációs szekció a technikai megvalósítás mélyére ás. A bal oldali lenyíló menüben található aloldalak részletesen bemutatják a szoftver egyes komponenseit, az adatbázis strukturális felépítését, az üzleti logikát és az alkalmazott biztonsági megoldásokat.

## Az Architektúra Fő Komponensei

A platform egy aszinkron adatfolyamra (Data Flow) épül, amely négy fő technológiai pilléren nyugszik. Ezek a rétegek egyértelműen meghatározott interfészeken (REST API) keresztül kommunikálnak egymással.

1. **Adatbázis Réteg (MySQL):** A platform "memóriája". Egy mélyen normalizált relációs adatbázis, amely 16 táblában tárolja az adatokat. Feladata a tranzakciók (ACID) biztosítása és az adatintegritás megőrzése idegen kulcsok (Foreign Keys) segítségével. *(Részletesen az Adatbázis felépítése oldalon).*
2. **Szerveroldali Logika (Backend - Node.js & Express):** A rendszer "agya". Ez a réteg fogadja a kliens kéréseit, végzi el a bemeneti adatok validációját, kommunikál az adatbázissal, és végrehajtja az összetett üzleti logikákat (pl. átlagpontszámítás, jelszótitkosítás). Szintén ez a réteg felel az automatizált folyamatokért (Cron Jobs és Web Scraping). *(Részletesen a Backend és API oldalon).*
3. **Kliensoldali Felület (Frontend - React + Vite):** A felhasználókkal kapcsolatot tartó vizuális réteg. Egy komponensalapú Single Page Application (SPA), amely biztosítja a villámgyors navigációt az oldal újratöltése nélkül. Felelős a felhasználói élményért (UX), a reszponzív megjelenésért (UI) és az állapotkezelésért (State Management). *(Részletesen a Frontend és Felület oldalon).*
4. **Biztonság és Minőségbiztosítás:** Egy horizontális réteg, amely az egész rendszert átszövi. Magában foglalja az API végpontok JWT (JSON Web Token) védelmét, a szerepkör-alapú hozzáférés-szabályozást (RBAC a Vezérlőpultnál), valamint az automatizált egység- és integrációs teszteket (Jest és Selenium). *(Részletesen az Admin Vezérlőpult és a Szoftvertesztelés oldalakon).*

Kérjük, navigáljon a bal oldali menü pontjaira a specifikus műszaki részletek, kódrészletek és Entity-Relationship diagramok megtekintéséhez!