---
id: frontend
sidebar_position: 7
title: Frontend és Felület
---

# Frontend (React) Kliens és Felhasználói Élmény (UX)

A MoziPont kliensoldali felülete egy villámgyors, komponensalapú **React** alkalmazás (Single Page Application), amelyet a legmodernebb **Vite** fejlesztői környezettel építettünk fel. A szoftver fejlesztése során a letisztultságra és a teljesítményre fókuszáltunk. Szándékosan kerültük a "nehéz", túlzottan felfújt külső UI keretrendszerek (mint a Bootstrap vagy a Material UI) használatát. Helyette a teljes vizuális megjelenést egyedi, jól strukturált CSS fájlokkal és CSS Grid / Flexbox rácsrendszerekkel alakítottuk ki, ami tökéletes reszponzivitást biztosít asztali géptől a mobilkijelzőkig.

## Webalkalmazás Elérése

A rendszer indítása után a weboldal az alábbi címen érhető el:

🌐 **URL:** `http://localhost:8090`

## Kezdőoldal, Navigáció és Hero Section

Az alkalmazásba lépve a felhasználót egy vizuálisan megkapó, dinamikus kezdőoldal fogadja. A képernyő felső harmadát egy automatikusan lapozódó **Hero Slider** uralja, amely a platform kiemelt, vagy legújabb tartalmait reklámozza óriási, nagy felbontású borítóképekkel és azonnali "Megnézem" gombokkal.
Alatta a filmek és sorozatok kategóriák szerint (pl. Akció, Vígjáték, Ajánlott) vannak csoportosítva, vízszintesen görgethető (scroll) kártyasorokban. A kártyák a hover (rámutatás) effekteknek köszönhetően élnek a képernyőn, és azonnal mutatják az aktuális közösségi pontszámot.

![A MoziPont dinamikus főoldala a kiemelt sliderrel](/img/kezdooldal.png)

A navigációs sávba épített **Keresőmotor** jelentősen növeli az UX (User Experience) minőségét. Nem egy új oldalra irányítja át a felhasználót, hanem React állapotkezeléssel (State), valós időben, gépelés közben küld kéréseket a backendnek. A találatok – beleértve a posztereket és a műfajt is – egy elegáns, lenyíló ablakban (dropdown) jelennek meg.

![A dinamikus keresőmező valós idejű találatokkal](/img/kereso.png)

## Modális Ablakok és Autentikáció

Az alkalmazás egyik alapelve, hogy a felhasználót ne zökkentsük ki a tartalomfogyasztásból felesleges oldaltöltésekkel. Ezt központi **Modal** (felugró ablak) komponensekkel értük el. A tartalom részletei, a trailerek, és az értékelések írása is ilyen sötétített hátterű ablakokban történik.
Ugyanez igaz az autentikációra is: a "Bejelentkezés" és "Regisztráció" űrlapok egy közös, animált felugró ablakban (`AuthModal.jsx`) kaptak helyet.

![A modern, integrált autentikációs felugró ablak](/img/auth-modal.png)

### Profil Módosítása és Perszonalizáció (`ProfileEditor.jsx`)
A sikeres bejelentkezést a React Context API kezeli globálisan. Ezt követően a jobb felső sarokban elérhetővé válik a felhasználó lenyíló Profil menüje. Ide kattintva egy komplex szerkesztőfelület nyílik meg:
* **Alapadatok:** Bármikor frissíthető az Avatar (profilkép) linkje, a felhasználónév és a megjelenített név.
* **Jelszócsere:** Biztonsági validációval egybekötve cserélhető a belépési jelszó.
* **Kedvenc Kategóriák (Okos ajánló):** A felhasználók itt jelölhetik be kedvenc műfajaikat. A backend ezeket a paramétereket felhasználva súlyozza az SQL lekérdezéseket, így a kezdőoldalon megjelenő "Neked Ajánlott" szekció teljesen személyre szabottá válik.

![A profil szerkesztő felület és az egyedi kategória beállítások](/img/profil-szerkesztes.png)

## Interaktív Lábléc (Footer) és Kapcsolat

Az oldal struktúráját egy átfogó Lábléc zárja. Amellett, hogy tartalmazza a kötelező navigációs elemeket és a GitHub repozitórium hivatkozását, komoly funkciót is ellát. A beépített **Üzenetküldő (Kapcsolat)** űrlap segítségével a látogatók API híváson keresztül közvetlen üzenetet, hibajelentést vagy filmajánlást küldhetnek a fejlesztőknek. Ezek a "Ticket"-ek egyenesen az Admin vezérlőpultra futnak be.

![A weboldal lábléce a beépített kapcsolat űrlappal](/img/footer-kapcsolat.png)

## Egyedi Fejlesztésű Aloldalak

A platform több speciális nézettel rendelkezik:
* **Top 50 Tartalom:** Valós időben frissülő, a közösségi értékelések alapján rendezett vizuális ranglista.
* **Heti Ajánló:** A szerkesztőségi kiemelések dedikált felülete, egyedi designnal.

![A Top 50 film és a Heti Ajánló ranglista](/img/top50.png)
![A Heti Ajánló szekció felülete](/img/heti-ajanlo.png)

### Interaktív Mozi Térkép (`CinemaMap.jsx`)
Ez a modul a nyílt forráskódú Leaflet.js könyvtárat integrálja a React környezetbe. A térkép szabadon mozgatható, és beépített Geolocation API hívással képes a felhasználó aktuális pozíciójára ugrani, hogy megmutassa a legközelebbi mozikat. A térkép markerei (gombostűi) vizuálisan színkódoltak: a Cinema City, a Kultik és az Art mozik más-más színnel jelennek meg az egyszerűbb vizuális azonosítás érdekében.

![A Leaflet alapú interaktív mozitérkép](/img/moziterkep.png)