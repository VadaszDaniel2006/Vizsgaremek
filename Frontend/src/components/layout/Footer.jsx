import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const [locationStatus, setLocationStatus] = useState('Állapot ellenőrzése...');

  useEffect(() => {
    const checkLocationPermission = async () => {
      if ("geolocation" in navigator && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          
          const updateStatus = (state) => {
            if (state === 'granted') setLocationStatus('Engedélyezve');
            else if (state === 'prompt') setLocationStatus('Engedélykérésre vár');
            else setLocationStatus('Letiltva');
          };

          updateStatus(result.state);
          result.onchange = () => updateStatus(result.state);
        } catch (error) {
          setLocationStatus('Nem ellenőrizhető');
        }
      } else {
        setLocationStatus('Nem támogatott');
      }
    };

    checkLocationPermission();
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-main">
          
          <div className="footer-left">
            <h2 className="footer-brand">MoziPont</h2>
            <div className="footer-socials">
              <a href="https://www.facebook.com/groups/1703104210893357" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/mozipont1/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-links">
              <Link to="/sugokozpont">Súgóközpont</Link>
              <Link to="/kapcsolat">Kapcsolat</Link>
              <Link to="/aszf">Használati feltételek</Link>
              <Link to="/adatvedelem">Adatvédelem</Link>
              
            </div>
          </div>

        </div>

        <div className="footer-location-wrapper">
          <div className="location-header">
            <i className="fas fa-map-marker-alt"></i> 
            <span className="location-status">Helymeghatározás: {locationStatus}</span>
          </div>
          <p className="location-disclaimer">
            A legközelebbi mozik pontos megjelenítése érdekében az oldal kérheti a tartózkodási helyedet. 
            Az adatok biztonságos kezeléséről az <Link to="/adatvedelem">Adatvédelmi tájékoztatóban</Link> olvashatsz.
          </p>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MoziPont. Minden jog fenntartva.</p>
        </div>

      </div>
    </footer>
  );
}