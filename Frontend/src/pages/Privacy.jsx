import React from 'react';

export default function Privacy() {
  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '110px 20px 60px', color: '#d1d5db', lineHeight: '1.8', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ffffff', borderBottom: '2px solid #374151', paddingBottom: '15px', marginBottom: '30px', fontSize: '2.5rem' }}>Adatvédelmi és Adatkezelési Tájékoztató</h1>
      
      <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
        A MoziPont elkötelezett az Ön személyes adatainak védelme iránt. Jelen dokumentum az Európai Unió Általános Adatvédelmi Rendelete (GDPR) és az Információs önrendelkezési jogról szóló törvény (Infotv.) iránymutatásai alapján készült. Célja, hogy teljesen átláthatóvá tegye, milyen adatokat gyűjtünk Önről, amikor regisztrál, kommentel, vagy használja a Mozi Térkép funkciót.
      </p>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>1. Kezelt adatok köre és az Adatkezelés célja</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li style={{ marginBottom: '10px' }}><strong>Regisztrációs adatok:</strong> E-mail cím, felhasználónév, titkosított (hashed) jelszó. <em>Cél:</em> A felhasználói fiók létrehozása, a biztonságos bejelentkezés biztosítása és a jelszó-helyreállítás.</li>
          <li style={{ marginBottom: '10px' }}><strong>Profil és Preferencia adatok:</strong> Kedvelt filmes kategóriák, létrehozott listák (pl. "Megnézem"), kedvelt (liked) filmek. <em>Cél:</em> A Kezdőoldali személyre szabott filmajánló algoritmus működtetése.</li>
          <li style={{ marginBottom: '10px' }}><strong>Helymeghatározási (Geolokációs) adatok:</strong> Szélességi és hosszúsági koordináták a Mozi Térkép használatakor. <em>Cél:</em> A legközelebbi mozik listázása. Ezt az adatot <strong>kizárólag az Ön kifejezett böngésző-szintű engedélyével</strong> kérjük le, és azt a szervereinken nem tároljuk, a munkamenet végén azonnal megsemmisül.</li>
          <li style={{ marginBottom: '10px' }}><strong>Közösségi adatok:</strong> Az Ön által írt nyilvános kommentek és azok időbélyegei.</li>
        </ul>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>2. Adatmegőrzési idő (Meddig tároljuk az adatokat?)</h2>
        <p style={{ marginBottom: '15px' }}>
          A MoziPont az adattakarékosság elvét követi. Az Ön regisztrációs és profiladatait addig tároljuk, amíg a felhasználói fiókja aktív. 
        </p>
        <p style={{ marginBottom: '15px' }}>
          Amennyiben Ön a fiókja törlése mellett dönt, a regisztrációs adatait (e-mail cím, jelszó) azonnal és véglegesen töröljük. Az Ön által írt nyilvános kommentek esetében a profil törlése után a név helyén az "Inaktív Felhasználó" felirat jelenik meg, de a komment szövege megmaradhat, kivéve, ha Ön a fióktörlés előtt kifejezetten kéri a hozzászólásai teljes eltávolítását is.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>3. Adatbiztonság és Adatfeldolgozók</h2>
        <p style={{ marginBottom: '15px' }}>
          A rendszereink közötti kommunikáció (a böngészője és a szerverünk között) minden esetben erős SSL/TLS titkosításon (HTTPS) keresztül történik. A jelszavakat soha nem tároljuk egyszerű szöveges formátumban, kizárólag egyirányú, modern titkosító algoritmusokkal (pl. bcrypt) védve.
        </p>
        <p style={{ marginBottom: '15px' }}>
          Az oldal működtetéséhez külső adatfeldolgozókat vehetünk igénybe (pl. szerver hosting szolgáltató, adatbázis-kezelő rendszerek). Ezen partnereink szigorú titoktartási és adatfeldolgozói szerződés (DPA) hatálya alatt állnak, adatait saját marketing céljaikra nem használhatják fel.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '15px' }}>4. Az Ön jogai és Jogorvoslat</h2>
        <p style={{ marginBottom: '15px' }}>
          Ön jogosult kérelmezni az Önre vonatkozó személyes adatokhoz való hozzáférést (kikérheti, mit tárolunk Önről), azok helyesbítését, törlését (az elfeledtetéshez való jog), vagy kezelésének korlátozását. Továbbá megilleti az adathordozhatósághoz való jog. Kérelmét a <strong>mozipont1@gmail.com</strong> e-mail címen nyújthatja be, amelyre legfeljebb 30 napon belül érdemben válaszolunk.
        </p>
        <p style={{ marginBottom: '15px' }}>
          Amennyiben úgy véli, hogy a személyes adatainak kezelése sérti a GDPR rendeletet, jogosult panaszt tenni a felügyeleti hatóságnál (Magyarországon a Nemzeti Adatvédelmi és Információszabadság Hatóságnál - NAIH; cím: 1055 Budapest, Falk Miksa utca 9-11., web: naih.hu).
        </p>
      </section>
    </div>
  );
}