---
id: admin-vezerlopult
sidebar_position: 8
title: Admin Vezérlőpult
---

# Adminisztrációs Vezérlőpult és Rendszerfelügyelet

Egy ekkora adathalmazzal dolgozó platform hosszú távú üzemeltetése és tartalommal való feltöltése lehetetlen feladat egy professzionális menedzsment felület nélkül. A MoziPont esetében a backend adatbázis közvetlen manipulálása (SQL konzolon keresztül) helyett egy biztonságos, integrált **Admin Dashboard** (`AdminDashboard.jsx`) komponenst fejlesztettünk le.

## Biztonság és Hozzáférés (RBAC)

Az Admin Vezérlőpult szigorúan védett útvonalon (Protected Route) helyezkedik el. A hozzáférést egy Role-Based Access Control (RBAC) mechanizmus szabályozza: a felület kizárólag azokból a profilokból érhető el, ahol a sikeres bejelentkezéskor kapott JWT tokenben, és a mögöttes MySQL adatbázisban a felhasználó `jogosultsag` mezője `admin` értékre van állítva. Jogosulatlan kérés esetén a szerver 403 Forbidden hibát dob, a React Router pedig automatikusan visszairányítja a felhasználót a főoldalra.

A felület dizájnja letisztult, egy bal oldali fix navigációs sávra épül, amellyel a rendszergazdák négy fő modul (Felhasználók, Tartalom, Jelentések, Üzenetek) között válthatnak.

## 1. Felhasználók Kezelése
Az alapértelmezett modul egy átlátható, sorba rendezhető táblázatban jeleníti meg a platform teljes regisztrált bázisát. A rendszergazdák áttekinthetik az ID-kat, e-mail címeket és aktuális szerepköröket. 
Az interakciós gombokkal a felhasználói fiókok adatai szerkeszthetők – például itt lehet egy normál 'user'-t 'admin' rangra emelni –, a platform szabályait megsértő, vagy inaktív profilok pedig egy biztonsági jóváhagyás után véglegesen törölhetők (DELETE) a rendszerből.

![Felhasználói fiókok kezelése az Admin panelen](/img/admin-users.png)

## 2. Tartalom Kezelő (CRUD Modul)
Ez a platform "motorházteteje", a legösszetettebb funkciókkal rendelkező rész, amely a filmes adatbázis karbantartásáért felel. A könnyebb kezelhetőség érdekében két alszekcióra (fülre) osztottuk:

* **Meglévő Tartalmak Szerkesztése (Update & Delete):** Egy gyorskeresővel ellátott listanézet, amelyben az összes platformra feltöltött tartalom (film, sorozat) szerepel. Ha egy feltöltött filmnél frissíteni kell a poszter URL-jét, módosítani kell a szöveges leírást, vagy új kategóriát kell hozzáadni, az adminisztrátor a "Szerkesztés" gombra kattint. Ekkor egy előre kitöltött űrlap jelenik meg, aminek mentésekor a backend végrehajtja a szükséges SQL UPDATE parancsokat. Ugyanitt lehetőség van a tartalmak végleges törlésére is.

![Meglévő tartalmak listája és szerkesztése](/img/admin-tartalom-lista.png)

* **Új Feltöltés (Create):** A rendszer bővítéséhez egy szigorú kliens- és szerveroldali validációval (kötelező mezők ellenőrzésével) ellátott űrlap áll rendelkezésre. A rendszergazda itt töltheti ki a metaadatokat (Cím, Leírás, Megjelenés, Értékelés), ágyazhat be YouTube előzetest, és rendelhet hozzá több kategóriát is (Checkboxok segítségével). A sikeres mentés pillanatában a tartalom bekerül a MySQL adatbázisba, és azonnal, valós időben megjelenik a publikus kezdőoldalon a felhasználók számára.

![Új film vagy sorozat feltöltési űrlapja](/img/admin-upload.png)

## 3. Moderáció és Jelentett Kommentek
A MoziPont platform támogatja a szólásszabadságot, de a közösségi élmény megőrzése érdekében fontos a toxikus megnyilvánulások szűrése. A normál felhasználók egy zászló ikonnal "Jelenthetik" a sértő, rasszista, vagy spoilert tartalmazó értékeléseket.
A "Jelentések" fülön az adminisztrátorok egy dedikált listában látják ezeket az "elkapott" véleményeket. A táblázat mutatja a komment íróját, a panaszt tevő felhasználót, és a jelentés pontos indokát. Az adminisztrátor megvizsgálja az esetet, majd dönt: a "Zöld" gombbal elutasítja a jelentést (ha alaptalan volt), a "Piros kuka" ikonnal pedig véglegesen törli a kommentet a platformról.

![A jelentett, moderálásra váró vélemények listája](/img/admin-jelentesek.png)

## 4. Ügyfélszolgálati Rendszer (Üzenetek / Ticketek)
A frontend Láblécében (Footer) található Kapcsolat űrlapon beküldött összes felhasználói levél közvetlenül ide, az "Üzenetek" fül alá érkezik. A felület egy egyszerű "Ticketing" (Jegykezelő) rendszerként funkcionál. A táblázat listázza a feladót, a kapcsolatfelvételi címet, és az elküldött szöveget (ami lehet például technikai hibajelentés, vagy kérés egy új film feltöltésére). A rendszergazdák itt tudják nyomon követni az elvégzendő feladatokat, a megoldott ügyeket pedig a lista "Archiválás / Törlés" gombjával zárhatják le.

![A felhasználók által beküldött ügyfélszolgálati üzenetek](/img/admin-uzenetek.png)