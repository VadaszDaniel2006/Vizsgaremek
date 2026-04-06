import React, { useState, useEffect } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ nev: '', email: '', tema: '', uzenet: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (copyStatus) {
      const timer = setTimeout(() => setCopyStatus(''), 3000);
      return () => clearTimeout(timer); 
    }
  }, [copyStatus]);

  useEffect(() => {
    if (status.type === 'success') {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    let currentUserId = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        currentUserId = userObj.id || null;
      }
    } catch (error) {
      console.error("Nem sikerült kiolvasni a felhasználót a localStorage-ből.");
    }

    const payload = {
      ...formData,
      felhasznalo_id: currentUserId
    };

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Üzenet sikeresen elküldve! Hamarosan válaszolunk.' });
        setFormData({ nev: '', email: '', tema: '', uzenet: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Hiba történt a küldés során.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Nem sikerült csatlakozni a szerverhez.' });
    }
    setIsSubmitting(false);
  };

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('mozipont1@gmail.com');
    setCopyStatus('E-mail cím sikeresen másolva a vágólapra!');
  };

  return (

    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '110px 20px 60px', color: '#d1d5db', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#ffffff', fontSize: '2.8rem', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>Kapcsolat és Ügyfélszolgálat</h1>
      <p style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '50px', color: '#9ca3af', lineHeight: '1.6' }}>
        Kérdésed, kérésed vagy panaszod van? A MoziPont csapata elkötelezett a gyors és hatékony segítségnyújtás mellett. Kérjük, válaszd ki a számodra megfelelő elérhetőséget!
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
        <div style={{ backgroundColor: '#111827', padding: '40px', borderRadius: '15px', border: '1px solid #374151', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '500px', width: '100%' }}>
          <i className="fas fa-envelope" style={{ fontSize: '3.5rem', color: '#3b82f6', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1.6rem' }}>Központi E-mail címünk</h2>
          <p style={{ marginBottom: '25px', color: '#9ca3af' }}>Kattints a gombra az e-mail cím másolásához, ha a saját leveleződből szeretnél írni nekünk!</p>

          <button 
            onClick={handleCopyEmail} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#2563eb', color: '#fff', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', transition: '0.3s' }}
          >
            <i className="fas fa-copy"></i> mozipont1@gmail.com
          </button>
          
          {copyStatus && (
            <div style={{ marginTop: '15px', color: '#10b981', fontWeight: 'bold' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
              {copyStatus}
            </div>
          )}
          
          <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#6b7280' }}>Várható válaszidő: 24-48 óra munkanapokon.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', padding: '40px', borderRadius: '15px', marginTop: '50px' }}>
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.8rem' }}>Üzenet küldése közvetlenül az oldalról</h2>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Töltsd ki az alábbi űrlapot, és üzeneted azonnal az Adminisztrátori pultba kerül!</p>

        {status.message && (
          <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: status.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}` }}>
            {status.type === 'success' ? <i className="fas fa-check-circle" style={{marginRight: '10px'}}></i> : <i className="fas fa-exclamation-circle" style={{marginRight: '10px'}}></i>}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Neved vagy Felhasználóneved" required value={formData.nev} onChange={(e) => setFormData({...formData, nev: e.target.value})} style={{ flex: 1, minWidth: '250px', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff' }} />
            <input type="email" placeholder="E-mail címed" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ flex: 1, minWidth: '250px', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff' }} />
          </div>
          <select required value={formData.tema} onChange={(e) => setFormData({...formData, tema: e.target.value})} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff' }}>
            <option value="" disabled>Válassz témát...</option>
            <option value="Technikai hiba">Technikai hiba (Nem működik valami)</option>
            <option value="Tartalmi hiba">Tartalmi hiba (Hibás adat egy filmnél)</option>
            <option value="Fiók probléma">Fiók probléma (Jelszó, törlés, módosítás)</option>
            <option value="Ötlet / Javaslat">Ötlet / Javaslat az oldalhoz</option>
            <option value="Egyéb">Egyéb</option>
          </select>
          <textarea rows="6" placeholder="Üzeneted szövege..." required value={formData.uzenet} onChange={(e) => setFormData({...formData, uzenet: e.target.value})} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff', resize: 'vertical' }}></textarea>
          <button type="submit" disabled={isSubmitting} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: isSubmitting ? '#4b5563' : '#3b82f6', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.3s' }}>
            {isSubmitting ? 'Küldés folyamatban...' : 'Üzenet elküldése'}
          </button>
        </form>
      </div>
    </div>
  );
}