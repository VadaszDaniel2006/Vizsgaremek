// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Közösségi ikonok */}
        <div className="footer-socials">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
        </div>

        {/* Linkek rács elrendezésben */}
        <div className="footer-links">
          <ul>
            <li><a href="#">Hangos leírás</a></li>
            <li><a href="#">Befektetői kapcsolatok</a></li>
            <li><a href="#">Jogi nyilatkozat</a></li>
          </ul>
          <ul>
            <li><a href="#">Súgóközpont</a></li>
            <li><a href="#">Álláslehetőségek</a></li>
            <li><a href="#">Cookie beállítások</a></li>
          </ul>
          <ul>
            <li><a href="#">Ajándékkártyák</a></li>
            <li><a href="#">Használati feltételek</a></li>
            <li><a href="#">Céginformációk</a></li>
          </ul>
          <ul>
            <li><a href="#">Médiaközpont</a></li>
            <li><a href="#">Adatvédelem</a></li>
            <li><a href="#">Kapcsolat</a></li>
          </ul>
        </div>

        {/* Szervizkód gomb (Dizájn elem) */}
        <div className="service-code">
            <button>Szervizkód</button>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; 2026 MoziPont. Minden jog fenntartva.</p>
        </div>

      </div>
    </footer>
  );
}