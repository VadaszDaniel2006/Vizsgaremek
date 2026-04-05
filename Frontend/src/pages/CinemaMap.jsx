import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './CinemaMap.css';

const getMarkerIcon = (nev) => {
  let color = 'blue'; 
  if (nev.toLowerCase().includes('cinema city')) color = 'red';
  else if (nev.toLowerCase().includes('kultik')) color = 'orange';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const getCinemaFeatures = (nev) => {
  const name = nev.toLowerCase();
  const features = [];
  if (name.includes('aréna')) features.push('IMAX', '4DX', 'ScreenX', 'VIP');
  if (name.includes('westend') || name.includes('győr') || name.includes('debrecen')) features.push('4DX');
  if (name.includes('etele')) features.push('Prémium', 'Dolby Atmos');
  if (name.includes('cinema city') || name.includes('kultik')) features.push('3D');
  if (name.includes('corvin') || name.includes('puskin') || name.includes('toldi')) features.push('Art Mozi');
  if (features.length === 0) features.push('Digitális 2D');
  return features;
};

const hungaryBounds = [
  [43.00, 13.00], 
  [54.00, 26.00]  
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const CinemaMap = () => {
  const [moziLista, setMoziLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocated, setIsLocated] = useState(false);
  const mapRef = useRef(null);
  const centerPoint = [47.1625, 19.5033];

  useEffect(() => {
    fetch('http://localhost:5000/api/mozik') 
      .then(res => res.json())
      .then(data => { setMoziLista(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLocateNearest = () => {
    if (isLocated) {
      mapRef.current?.flyTo(centerPoint, 7, { duration: 1.5 });
      setIsLocated(false);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        if (moziLista.length > 0) {
          let closest = moziLista[0];
          let minD = calculateDistance(userLat, userLng, closest.lat, closest.lng);
          moziLista.forEach(m => {
            const d = calculateDistance(userLat, userLng, m.lat, m.lng);
            if (d < minD) { minD = d; closest = m; }
          });

          mapRef.current?.flyTo([closest.lat, closest.lng], 13, { duration: 2 });
          setIsLocated(true);
        }
      });
    }
  };

  return (
    <div className="terkep-oldal" style={{ paddingTop: '130px' }}>
      <div className="terkep-fejlec">
        <h1 className="terkep-cim">Magyarország <span>Mozitérképe</span></h1>
        <p className="terkep-leiras">Találd meg a tökéletes helyszínt a következő filmhez!</p>
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
          <div className="terkep-toltes">Betöltés...</div>
        ) : (
          <>
            <MapContainer 
              center={centerPoint} 
              zoom={7} 
              minZoom={7} 
              maxBounds={hungaryBounds} 
              maxBoundsViscosity={0.2} 
              style={{ height: '600px', width: '100%', zIndex: 1 }} 
              ref={mapRef} 
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {moziLista.map((mozi) => {

                const isEdge = mozi.lat > 47.5 || mozi.lng < 17.0;

                return (
                  <Marker 
                    key={mozi.id} 
                    position={[mozi.lat, mozi.lng]} 
                    icon={getMarkerIcon(mozi.nev)}
                    eventHandlers={{
                      click: () => {

                        mapRef.current?.panTo([mozi.lat, mozi.lng], { animate: true, duration: 0.6 });
                      }
                    }}
                  >
                    <Popup 
                      autoPan={false} 
                      eventHandlers={{
                        remove: () => {

                          if (isEdge && mapRef.current) {
                            setTimeout(() => {

                              mapRef.current.setView(centerPoint, 7, { 
                                animate: true, 
                                duration: 1.0 
                              });
                            }, 200);
                          }
                        }
                      }}
                    >
                      <div className="popup-tartalom">
                        <h3 className="popup-cim">{mozi.nev}</h3>
                        <p className="popup-cim-szoveg">{mozi.cim}</p>
                        <div className="cimkek-tarolo">
                          {getCinemaFeatures(mozi.nev).map((f, i) => (
                            <span key={i} className="cimke">{f}</span>
                          ))}
                        </div>
                        <a href={mozi.url} target="_blank" rel="noopener noreferrer" className="jegy-gomb">Műsor és Jegyek</a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            <button className="locate-btn" onClick={handleLocateNearest}>
              <i className={isLocated ? "fas fa-globe" : "fas fa-location-arrow"}></i>
              {isLocated ? "Teljes térkép" : "Legközelebbi mozi"}
            </button>
          </>
        )}
      </div>

      <div className="kartya-grid">
        <div className="kartya">
          <h3 style={{ color: '#e11d48' }}>🎬 Blockbuster Élmény</h3>
          <p>A multiplex mozikban a legújabb hollywoodi szuperprodukciókat élvezheted.</p>
        </div>
        <div className="kartya">
          <h3 style={{ color: '#3b82f6' }}>🍿 Klasszikus & Art Mozik</h3>
          <p>Eredeti nyelven vetített alkotások és történelmi hangulat vár a művészmozikban.</p>
        </div>
        <div className="kartya">
          <h3 style={{ color: '#10b981' }}>🎟️ Premier Előtt</h3>
          <p>Ne maradj le semmiről! Találd meg a legközelebbi helyszínt az exkluzív vetítésekhez.</p>
        </div>
      </div>
    </div>
  );
};

export default CinemaMap;