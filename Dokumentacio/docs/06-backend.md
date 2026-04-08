---
id: backend
sidebar_position: 6
title: Backend és API
---

# Backend (Node.js & Express) és Üzleti Logika

A MoziPont szerveroldali rendszere egy rendkívül gyors, nem-blokkoló (non-blocking I/O) aszinkron architektúrára épül, amelyet **Node.js** és az **Express.js** keretrendszer biztosít. A fejlesztés során szigorúan betartottuk a Model-View-Controller (MVC) mintázat szabályait (bár SPA esetén a View a React), és a kódot API-központú, szerviz-orientált struktúrába rendeztük a skálázhatóság érdekében.

A projektkönyvtár áttanulmányozásakor jól látható a logikai elkülönülés: a végpontok útválasztása (Routes), az adatbázis-konfiguráció, a védelmi rétegek (Middleware-ek), és az üzleti logikát végrehajtó vezérlők (Controllers) külön mappákban, modularizálva helyezkednek el.

![Backend Mappastruktúra a VS Code-ban](/img/mappa-struktura.png)

## Biztonság és Kriptográfia (`authController.js`)

Az adatbiztonság a platform legmagasabb prioritású eleme. A regisztrációs és bejelentkezési folyamatokat végző `authController` garantálja, hogy érzékeny adatok ne kerüljenek kompromittálásra. 
Jelszavak esetében szigorúan tilos a sima szöveges (plain-text) tárolás. Ehelyett a `bcryptjs` könyvtárat használjuk egy 10 körös "salt" eljárással, ami brute-force támadások ellen is védi az adatbázist.

Sikeres bejelentkezés esetén a backend nem használ elavult szerveroldali session-öket. Ehelyett egy **JSON Web Token (JWT)**-t generál, amely a felhasználó azonosítóját (`id`) és szerepkörét (`role`) tartalmazza digitálisan aláírva. Ez a token 2 órán át érvényes, és a kliens ezt küldi el a HTTP fejlécben (`Authorization: Bearer <token>`) minden védett kérésnél.

![Kódrészlet: A JWT token generálása és a jelszó Bcrypt ellenőrzése](/img/auth-logic.png)

A végpontok szintjén a `middleware` mappában található `protect` függvény ellenőrzi a token érvényességét, míg az `admin` middleware gondoskodik a jogosultság-alapú hozzáférésről (RBAC), meggátolva, hogy normál felhasználók kritikus (pl. DELETE) műveleteket hajtsanak végre.

## Üzleti Logika és Dinamikus Számítások

### Átlagpontszámok Újraszámolása (Triggerek helyett Controller logika)
A rendszer hitelességét a valós, közösségi értékelések adják. Az `interactionController.js` tartalmazza azt a komplex logikát, amely gondoskodik az adatok konzisztenciájáról. Amikor egy felhasználó elküld egy új értékelést (1-10), a rendszer egy aszinkron adatbázis lekérdezéssel azonnal átlagolja az összes eddigi pontot, és frissíti a `media` tábla `rating` oszlopát, így a főoldalon azonnal a legfrissebb pontszám jelenik meg, külön SQL trigger írása nélkül.

![Kódrészlet: Az átlagpontszám automatikus újraszámolása](/img/update-average-rating.png)

### Automatizált Adatgyűjtés (Cinema Scraper Robot)
Hogy a moziműsorok manuális adatfeltöltés nélkül is naprakészek maradjanak, a `services` mappában létrehoztunk egy web scraping algoritmust (`cinemaScraper.js`). Ez a Node.js szkript a Puppeteer és Cheerio csomagokat használja a külső mozi-szolgáltatók (pl. Cinema City) komplex HTML DOM struktúrájának és API hívásainak elemzésére.
A robot intelligens adategyeztetést (String Matching) is végez: reguláris kifejezésekkel (Regex) eltávolítja a filmcímekből az ékezeteket, a "3D", "IMAX" és "Szinkronizált" jelzőket, hogy az így normalizált címet pontosan össze tudja párosítani az adatbázisunkban már meglévő media rekordokkal.

![Kódrészlet: A mozi adatgyűjtő robot HTML/API logikája](/img/cinema-scraper.png)

### Feladatok Automatikus Ütemezése (Cron Jobs)
A `server.js` fájl – a rendszer belépési pontja – nem csak a portokon figyel, hanem háttérfolyamatokat is ütemez. A `node-cron` csomag integrálásával a fent említett mozi adatgyűjtő robotot (Scraper) úgy konfiguráltuk, hogy a szerveridő szerint minden hajnalban automatikusan elinduljon. Ez az emberi beavatkozás nélkül működő folyamat minden éjjel letisztítja a már lejárt vetítéseket az adatbázisból, és feltölti a következő napok friss műsorait.

![Kódrészlet: A szerver indítása és a Cron Job ütemezése](/img/server-js.png)