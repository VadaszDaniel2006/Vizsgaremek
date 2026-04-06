import React from 'react';

export default function HelpCenter() {
  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '110px 20px 60px', color: '#d1d5db', lineHeight: '1.8', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ffffff', borderBottom: '2px solid #374151', paddingBottom: '15px', marginBottom: '30px', fontSize: '2.5rem' }}>Súgóközpont és GYIK</h1>
      
      <p style={{ marginBottom: '40px', fontSize: '1.1rem' }}>
        Összegyűjtöttük a platformunk használatával kapcsolatos leggyakoribb kérdéseket. Ha elakadtál a fiókod beállításával, nem érted a Heti Ajánló működését, vagy technikai hibába ütköztél, itt jó eséllyel azonnal megtalálod a megoldást.
      </p>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Hogyan működik a "Heti Ajánló" oldal (7.0 értékelés felett)?</h2>
        <p style={{ margin: 0 }}>A Heti Ajánló rendszerünk automatikusan figyeli a legújabb filmes és sorozatos premiereket. Annak érdekében, hogy megkíméljük a felhasználóinkat a gyenge minőségű alkotásoktól, <strong>kizárólag azokat a tartalmakat emeljük ki, amelyek a megbízható globális adatbázisokban stabilan 7.0-s vagy afölötti átlagértékelést értek el.</strong> Ez a garantált minőségi szűrőnk, amely minden héten automatikusan frissül a legújabb sikerekkel.</p>
      </div>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Hogyan működik a Kezdőoldali személyre szabott filmajánló?</h2>
        <p style={{ margin: 0 }}>Regisztrált felhasználóként a profilodban kiválaszthatod a kedvenc műfajaidat. Algoritmusunk ezeket az adatokat (kiegészítve azzal, hogy miket kedveltél vagy tettél listára az oldalon) használja fel arra, hogy a Kezdőoldaladra lépve azonnal a te ízlésednek megfelelő, ráadásul magasra értékelt filmeket dobjon be. Két felhasználó kezdőlapja így sosem ugyanolyan!</p>
      </div>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Hogyan használjam a Mozi Térképet mobilról vagy PC-ről?</h2>
        <p style={{ margin: 0 }}>Kattints a "Mozi Térkép" menüpontra, majd a "Legközelebbi mozi keresése" gombra. Ekkor a böngésződ engedélyt kér a helyadataid (GPS vagy IP alapú) eléréséhez. Engedélyezés után a térkép automatikusan kiszámítja a közeledben lévő filmszínházak távolságát. A helyadataidat szigorúan bizalmasan kezeljük, és nem mentjük el.</p>
      </div>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Tudom szerkeszteni vagy törölni a már megírt kommentemet?</h2>
        <p style={{ margin: 0 }}>Jelenleg a rendszerünk a közzétett hozzászólások utólagos szerkesztését nem támogatja az adatbázis konzisztenciája miatt. Azonban bármikor lehetőséged van a saját kommentedet <strong>törölni</strong> (a hozzászólás melletti 'Kuka' ikonra kattintva), majd egy újat írni helyette.</p>
      </div>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Mi a különbség a "Kedvelt filmek" és a "Saját Listák" között?</h2>
        <p style={{ margin: 0 }}>A "Kedvelés" (Szív ikon) egy gyors reakció: ezzel jelzed az algoritmusunknak és a Top 50-es ranglistának, hogy a film elnyerte a tetszésedet. Ezzel szemben a "Saját Listák" (pl. "Megnézem", "Kedvenc horrorjaim") funkcióval te magad rendszerezheted a tartalmakat, mintha egy könyvjelző mappát hoznál létre magadnak későbbi megtekintésre.</p>
      </div>

      <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' }}>Milyen eszközökön és böngészőkön működik tökéletesen az oldal?</h2>
        <p style={{ margin: 0 }}>A MoziPont egy reszponzív webalkalmazás, ami azt jelenti, hogy asztali számítógépen, laptopon, tableten és mobiltelefonon is tökéletesen jelenik meg. A legoptimálisabb élmény és a Mozi Térkép hibátlan működése érdekében a Google Chrome, Mozilla Firefox, Safari, vagy Microsoft Edge legfrissebb verzióinak használatát javasoljuk.</p>
      </div>
    </div>
  );
}