---
id: teszteles
sidebar_position: 9
title: Szoftvertesztelés
---

# Szoftvertesztelés és Minőségbiztosítás (QA)

Egy modern, mikro-szolgáltatás alapú és adatbázisra támaszkodó webalkalmazás (mint a MoziPont) fejlesztése során a legkisebb kódmódosítás is váratlan láncreakciókat okozhat a rendszerben. Ennek elkerülése érdekében a szoftverfejlesztési életciklusunkba (SDLC) szigorú minőségbiztosítási és többlépcsős tesztelési eljárásokat integráltunk. A tesztelés célja a magas fokú rendelkezésre állás, az adatbiztonság és a hibamentes felhasználói élmény garantálása volt.

A tesztelést két fő doménre bontottuk: a backend logika vizgálatára, és a kliensoldali felület szimulációjára.

## 1. Backend API Tesztelés

A szerveroldali logika (Node.js/Express) tesztelését manuális és automatizált megközelítések kombinációjával végeztük:

### API Végpontok Manuális Tesztelése (Postman)
A fejlesztés korai fázisában, amikor a React kliens még nem volt integrálva, a backend útvonalakat (Routes) a **Postman** platformmal vizsgáltuk. Ezzel az eszközzel lefedtük az összes CRUD (Create, Read, Update, Delete) metódust. Teszteltük, hogy a kérések paraméterezése (pl. `req.body`, `req.params`) és a JSON válaszok formátuma a specifikációnak megfelelő-e. 
Kiemelt figyelmet fordítottunk a Middleware-ek tesztelésére: szimuláltuk a jogosulatlan kéréseket (pl. admin végpont elérése normál felhasználóként, vagy hiányzó/lejárt JWT token), ellenőrizve, hogy a szerver helyesen a `401 Unauthorized` vagy `403 Forbidden` HTTP státuszkódokkal utasítja-e el a támadásokat.

![Sikeres API kérés és hitelesítés a Postman környezetben](/img/postman-auth.png)

### Automatizált Egységtesztek (Jest)
A hosszú távú kódstabilitás érdekében a Backend `/tests` mappájában automatizált egységteszteket (Unit Tests) írtunk a népszerű és rendkívül gyors **Jest** keretrendszerrel. 
A tesztek írása során mockolást (szimulációt) alkalmaztunk az adatbázis kapcsolatokon, így a tesztek futtatása nem írja felül a produkciós MySQL adatokat. A Jest szkriptek olyan kritikus üzleti logikákat validálnak, mint például az `authController` hibakezelése: dob-e a rendszer megfelelő hibakódot, ha duplikált e-mail címmel próbálunk regisztrálni, vagy ha nem egyezik a titkosított Bcrypt jelszó? 
Az `npx jest` parancs kiadásával a tesztek pár másodperc alatt lefutnak, a terminálban megjelenő zöld "PASS" üzenetek pedig bizonyítják, hogy az adott kódrészlet refaktorálás után is tökéletesen működik.

![Sikeresen lefutott Jest backend egységtesztek a terminálban](/img/jest-terminal.png)

**A Backend tesztek futtatásához:**
```bash
cd backend
npm test
```

---

## 2. Frontend End-to-End (E2E) Tesztelés

Bár az egységtesztek kiválóak a belső logika ellenőrzésére, a felhasználó a böngészőben lévő felülettel (UI) találkozik. Ennek komplex (End-to-End) ellenőrzésére a kliens `/selenium_tests` mappájában egy automatizált **Selenium Webdriver** alapú tesztkörnyezetet építettünk fel.

**A Frontend tesztek futtatásához szükséges lépések:**

Első indításkor:
```bash
cd Frontend
npm install selenium-webdriver
npm run test:all
```

További futtatások esetén:
```bash
cd Frontend
npm run test:all
```

A Selenium úgy funkcionál, mint egy fáradhatatlan, hihetetlenül gyors emberi tesztelő. Futáskor a szkript programozottan megnyitja a Google Chrome böngészőt, "kattint" a gombokon, szöveget gépel az input mezőkbe (pl. kereső, regisztráció), és JavaScript `assert` függvényekkel ellenőrzi, hogy a művelet hatására a megfelelő oldal töltődött-e be, vagy megjelent-e a várt Toast hibaüzenet a képernyőn.

A MoziPont jelenleg 30 darab, nagy lefedettségű (coverage) Selenium E2E tesztesetet tartalmaz, amelyeket logikailag öt tesztcsomagra (Test Suite) bontottunk a könnyebb karbantarthatóság miatt:
1. `auth.test.js`: A teljes belépési és regisztrációs workflow ellenőrzése (helyes és szándékosan hibás adatokkal egyaránt).
2. `admin.test.js`: Az Admin panel biztonsági kapujának, a navigációjának és a feltöltő űrlapok (Form) viselkedésének vizsgálata.
3. `movies.test.js`: A kezdőoldali DOM elemek (kártyák, slider) betöltésének ellenőrzése, és a részletező felugró (Modal) ablakok megfelelő nyitása.
4. `nav.test.js`: A React Router alapú navigáció, a reszponzív menüsáv, és a lenyíló okoskereső működésének validálása.
5. `features.test.js`: A profil szerkesztő (név, avatar, jelszó csere) komplex inputjainak, valamint a Leaflet.js alapú mozi térkép betöltésének tesztelése.

A fejlesztés során az `npm run test:all` parancs kiadásával az összes folyamat vizuálisan lefut, és a terminálban megjelenő zöld pipák (`✅`) garantálják a rendszer teljes, front-to-back működőképességét.

![A Selenium End-to-End felhasználói tesztek sikeres lefutása](/img/selenium-test.png)