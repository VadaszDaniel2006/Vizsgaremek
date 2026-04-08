---
id: bevezetes
sidebar_position: 1
title: Bevezetés
---

# Bevezetés, Vízió és Célkitűzések

A projektmunkánkat ketten valósítottuk meg: Palkovics Tamás Tibor és Vadász Dániel. A projektünk neve: **MoziPont**. A téma kiválasztását elsősorban a közös érdeklődési körünk inspirálta, hiszen mindketten szívesen töltjük a szabadidőnket a filmek és sorozatok világában. A modern tartalomfogyasztási szokásokat, valamint a hazai és nemzetközi piaci kínálatot megvizsgálva arra a következtetésre jutottunk, hogy bár léteznek hatalmas filmes adatbázisok, gyakran túlzsúfoltak, átláthatatlanok, vagy túlzottan reklámorientáltak. 

Célunk egy olyan komplex, hazai fókuszú platform megalkotása volt, amely egyetlen letisztult felületen integrálja a globális információszerzést (filmek adatai) és a lokális szolgáltatásokat (hazai moziműsorok), miközben erős közösségi élményt is nyújt.

## Problémafelvetés és a Piaci Rés

A jelenlegi filmes portálok (pl. IMDb, Port.hu, TMDb) használata során számos felhasználói fájdalompontot (pain point) azonosítottunk:
1. **Töredezett információk:** A felhasználóknak külön oldalakat kell felkeresniük, ha egy film nemzetközi értékelésére kíváncsiak, és megint mást, ha a helyi vetítési időpontokat keresik.
2. **Személyre szabhatóság hiánya:** A legtöbb oldal statikus toplistákat kínál, és nem veszi figyelembe a látogató egyedi ízlését vagy kedvenc műfajait.
3. **Elavult felhasználói felületek (UI):** Sok hazai portál elavult, nem reszponzív dizájnnal rendelkezik, ami megnehezíti a mobilos tartalomfogyasztást.

A MoziPont ezekre a problémákra kínál modern, Single Page Application (SPA) alapú megoldást, amely asztali számítógépen és mobileszközökön egyaránt kompromisszummentes élményt nyújt.

## A Projekt Részletes Célkitűzései

A fejlesztés során az alábbi konkrét funkcionális és nem-funkcionális követelményeket határoztuk meg:

* **Komplex Információs Bázis:** Részletes metaadatok (leírás, megjelenés éve, korhatár, hossz, kategóriák) és vizuális elemek (HD poszterek, YouTube trailerek) integrálása minden tartalomhoz.
* **Személyre Szabott Felhasználói Élmény:** Intelligens ajánlórendszer implementálása, amely a regisztrációkor vagy a profilban megadott kedvenc kategóriák (pl. Sci-Fi, Thriller) alapján súlyozza és jeleníti meg a tartalmakat a kezdőoldalon.
* **Közösségi Funkciók és Interakció:** Lehetőség 1-10 közötti skálán történő értékelésre és szöveges vélemények írására. Az alkalmazásnak valós időben kell újraszámolnia a filmek átlagpontszámát a közösségi visszajelzések alapján.
* **Saját Gyűjtemények Kezelése:** A "Saját lista" funkció révén a felhasználók elmenthetik azokat a tartalmakat, amelyeket a jövőben meg szeretnének tekinteni.
* **Lokáció-alapú Szolgáltatások:** Egy interaktív, térképes mozikereső modul létrehozása, amely integrálja a Cinema City, a Kultik és a független Art mozik hálózatát, konkrét vetítési időpontokkal.
* **Robusztus Adminisztráció:** Dedikált, biztonságos vezérlőpult kialakítása a tartalmak feltöltésére, a felhasználók kezelésére és a közösségi irányelvek betartatására (moderáció).

Összességében a vizsgaprojektünk nem csupán a technikai (Full-Stack webfejlesztési) tudásunkat és a modern keretrendszerekben (React, Node.js, Express, Docker) való jártasságunkat demonstrálja, hanem a szoftverfejlesztési életciklus (SDLC) teljes megértését a tervezéstől a tesztelésen át az üzemeltetésig.