import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './CinemaMap.css';

// --- Ikon generáló funkció a mozi típusa alapján ---
const getMarkerIcon = (nev) => {
  let color = 'blue'; 
  
  if (nev.toLowerCase().includes('cinema city')) {
    color = 'red';
  } else if (nev.toLowerCase().includes('kultik')) {
    color = 'orange';
  }

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// --- Extrák és típusok felismerése a név alapján ---
const getCinemaFeatures = (nev) => {
  const name = nev.toLowerCase();
  const features = [];
  
  if (name.includes('aréna')) features.push('IMAX', '4DX', 'ScreenX', 'VIP');
  if (name.includes('westend') || name.includes('győr') || name.includes('debrecen')) features.push('4DX');
  if (name.includes('mammut')) features.push('VIP');
  if (name.includes('etele')) features.push('Prémium', 'Dolby Atmos');
  
  if (name.includes('cinema city') || name.includes('kultik') || name.includes('etele')) {
    if (!features.includes('3D')) features.push('3D');
  }

  if (name.includes('corvin') || name.includes('puskin') || name.includes('művész') || 
      name.includes('toldi') || name.includes('art') || name.includes('apolló') || name.includes('belvárosi')) {
    features.push('Art Mozi');
  }

  if (features.length === 0) features.push('Digitális 2D');

  return features;
};

// VÉGLEGES JAVÍTÁS: Pontosan Magyarország földrajzi kiterjedése
// Így a "gumiszalag" azonnal aktiválódik föl-le húzásnál is!
const hungaryBounds = [
  [45.70, 16.10], // Délnyugati sarok (Horvát határ széle)
  [48.60, 22.90]  // Északkeleti sarok (Ukrán határ széle)
];

// --- MATEMATIKA: Távolság kiszámítása ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// --- FŐ KOMPONENS ---
const CinemaMap = () => {
  const [moziLista, setMoziLista] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isLocated, setIsLocated] = useState(false);
  
  const mapRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/mozik') 
      .then(res => res.json())
      .then(data => {
        setMoziLista(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba történt a mozik betöltésekor:", err);
        setLoading(false);
      });
  }, []);

  const handleLocateNearest = () => {
    if (isLocated) {
      if (mapRef.current) {
        mapRef.current.flyTo([47.1625, 19.5033], 7, {
          duration: 1.5
        });
      }
      setIsLocated(false); 
      return;
    }

    if (!navigator.geolocation) {
      alert("A böngésződ nem támogatja a helymeghatározást.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (moziLista.length > 0) {
          let closestMozi = moziLista[0];
          let minDistance = calculateDistance(userLat, userLng, closestMozi.lat, closestMozi.lng);

          moziLista.forEach((mozi) => {
            const dist = calculateDistance(userLat, userLng, mozi.lat, mozi.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closestMozi = mozi;
            }
          });

          if (mapRef.current) {
            mapRef.current.flyTo([closestMozi.lat, closestMozi.lng], 13, {
              duration: 2.0
            });
            setIsLocated(true); 
          }
        }
      },
      (error) => {
        alert("Nem sikerült lekérni a helyzetedet. Kérlek, engedélyezd a böngészőben a helyadatokhoz való hozzáférést!");
      }
    );
  };

  return (
    <div className="terkep-oldal" style={{ paddingTop: '130px' }}>
      
      <div className="terkep-fejlec">
        <h1 className="terkep-cim">
          Magyarország <span>Mozitérképe</span>
        </h1>
        <p className="terkep-leiras">
          Találd meg a tökéletes helyszínt a következő filmhez! A térképen színkódokkal jelöltük a különböző mozitípusokat, a felugró ablakokban pedig láthatod az elérhető technológiákat.
        </p>
      </div>

      <div className="jelmagyarazat">
        <div className="jel-elem">
          <span className="jel-pont" style={{ backgroundColor: '#e11d48' }}></span>
          <span>Cinema City</span>
        </div>
        <div className="jel-elem">
          <span className="jel-pont" style={{ backgroundColor: '#f97316' }}></span>
          <span>Kultik Hálózat</span>
        </div>
        <div className="jel-elem">
          <span className="jel-pont" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>Art & Független mozik</span>
        </div>
      </div>

      <div className="terkep-kontener">
        {loading ? (
          <div className="terkep-toltes">
            Mozik betöltése folyamatban...
          </div>
        ) : (
          <>
            <MapContainer 
              center={[47.1625, 19.5033]} 
              zoom={7} 
              minZoom={7} 
              maxBounds={hungaryBounds} /* Most már szorosan illeszkedik az országra */
              maxBoundsViscosity={0.8}  /* A visszaugrós "gumiszalag" effektus */
              style={{ height: '600px', width: '100%', zIndex: 1 }} 
              ref={mapRef} 
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {moziLista.map((mozi) => {
                const needsAutoPan = mozi.lat > 47.55;

                return (
                  <Marker key={mozi.id} position={[mozi.lat, mozi.lng]} icon={getMarkerIcon(mozi.nev)}>
                    <Popup 
                      autoPan={needsAutoPan} 
                      autoPanPaddingTopLeft={needsAutoPan ? [0, 80] : [0, 0]}
                      eventHandlers={{ 
                        remove: () => {
                          if (needsAutoPan && mapRef.current) {
                            mapRef.current.setView([47.1625, 19.5033], 7, { animate: true, duration: 0.5 });
                          }
                        } 
                      }} 
                    >
                      <div className="popup-tartalom">
                        <h3 className="popup-cim">{mozi.nev}</h3>
                        <p className="popup-cim-szoveg">{mozi.cim}</p>
                        
                        <div className="cimkek-tarolo">
                          {getCinemaFeatures(mozi.nev).map((feature, index) => (
                            <span key={index} className="cimke">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <a 
                          href={mozi.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="jegy-gomb"
                        >
                          Műsor és Jegyek
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            <button 
              className="locate-btn" 
              onClick={handleLocateNearest} 
              title={isLocated ? "Vissza a teljes országos térképre" : "Keresd meg a hozzám legközelebbi mozit"}
            >
              <i className={isLocated ? "fas fa-globe" : "fas fa-location-arrow"}></i>
              {isLocated ? "Teljes térkép" : "Legközelebbi mozi"}
            </button>
          </>
        )}
      </div>

      <div className="kartya-grid">
        <div className="kartya">
          <h3 style={{ color: '#e11d48' }}>🎬 Blockbuster Élmény</h3>
          <p>
            A multiplex mozikban a legújabb hollywoodi szuperprodukciókat élvezheted prémium minőségben. Hatalmas vásznak, dübörgő hangrendszerek és kényelmes fotelek garantálják a tökéletes szórakozást.
          </p>
        </div>
        <div className="kartya">
          <h3 style={{ color: '#3b82f6' }}>🍿 Klasszikus & Art Mozik</h3>
          <p>
            Ezek a mozik a valódi filmrajongóknak szólnak. Eredeti nyelven vetített alkotások, európai fesztiválfilmek és utánozhatatlan, történelmi hangulat vár a független és művészmozik termeiben.
          </p>
        </div>
        <div className="kartya">
          <h3 style={{ color: '#10b981' }}>🎟️ Premier Előtt</h3>
          <p>
            Ne maradj le semmiről! A térkép segítségével gyorsan megtalálod a legközelebbi helyszínt, ahol részt vehetsz a közönségtalálkozókon és a hivatalos megjelenés előtti exkluzív vetítéseken.
          </p>
        </div>
      </div>

    </div>
  );
};

export default CinemaMap;