import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';

export default function FejlesztesiNaplo() {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = `https://api.github.com/repos/VadaszDaniel2006/Vizsgaremek/commits?sha=main&per_page=100&t=${new Date().getTime()}`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Hiba történt: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const sortedData = [...data].sort((a, b) => {
            const dateA = new Date(a.commit.author.date);
            const dateB = new Date(b.commit.author.date);
            return dateB - dateA; 
          });
          
          setCommits(sortedData);
        } else {
          setError("Érvénytelen adat érkezett a GitHub-tól.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("GitHub API hiba:", err);
        setError("Nem sikerült lekérni a legfrissebb adatokat. Próbáld meg később!");
        setLoading(false);
      });
  }, []);

  return (
    <Layout title="Fejlesztési Napló" description="A projekt GitHub commit előzményei">
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ borderBottom: '2px solid var(--ifm-color-primary)', paddingBottom: '10px' }}>
          🚀 Fejlesztési Napló
        </h1>
        <p>A projekt forráskódjának valós idejű változásai a GitHub repository alapján.</p>

        {loading && <div style={{ textAlign: 'center', padding: '50px' }}>Adatok betöltése a GitHubról...</div>}
        
        {error && (
          <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff4d4d', padding: '20px', borderRadius: '8px', border: '1px solid #ff4d4d' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="commit-timeline" style={{ marginTop: '30px' }}>
            {commits.map((item, index) => (
              <div key={index} style={{
                borderLeft: '3px solid var(--ifm-color-primary)',
                paddingLeft: '25px',
                paddingBottom: '30px',
                position: 'relative',
                marginLeft: '15px'
              }}>
                <div style={{
                  width: '16px', height: '16px', background: 'var(--ifm-color-primary)',
                  borderRadius: '50%', position: 'absolute', left: '-10px', top: '0px',
                  boxShadow: '0 0 10px var(--ifm-color-primary)'
                }} />
                
                <div style={{
                  background: 'var(--ifm-card-background-color)',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  border: '1px solid var(--ifm-contents-border-color)'
                }}>
                  <div style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    📅 <strong>{new Date(item.commit.author.date).toLocaleDateString('hu-HU', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</strong>
                  </div>
                  
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--ifm-heading-color)' }}>
                    {item.commit.message}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.author && (
                      <img src={item.author.avatar_url} alt="avatar" style={{ width: '24px', borderRadius: '50%' }} />
                    )}
                    <span style={{ fontSize: '0.85rem' }}>
                      <strong>{item.commit.author.name}</strong> módosítása
                    </span>
                    <a href={item.html_url} target="_blank" rel="noopener noreferrer" 
                       style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--ifm-color-primary)', textDecoration: 'none' }}>
                      Kód megtekintése →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}