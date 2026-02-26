import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function Kereses() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); 
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // === GÖRGETÉS JAVÍTÁSA ===
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [query]); // A [query] miatt minden új keresésnél felugrik a tetejére

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/search?q=${query}`);
                const data = await res.json();
                setResults(data);
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        if (query) fetchResults();
    }, [query]);

    return (
        <div className="search-page-container" style={{ paddingTop: '140px', paddingBottom: '60px', paddingLeft: '4%', paddingRight: '4%', color: 'white', minHeight: '100vh', backgroundColor: '#0b0f2b', textAlign: 'left' }}>
            
            <h2 style={{ marginBottom: '40px', fontWeight: 'bold', fontSize: '2.2rem', textAlign: 'left' }}>
                Találatok: <span style={{ color: '#3e50ff' }}>"{query}"</span>
            </h2>
            
            {loading ? ( 
                <p style={{ fontSize: '1.2rem', color: '#aaa', textAlign: 'left' }}>Keresés az adatbázisban...</p> 
            ) : results.length > 0 ? (
                <div className="search-grid">
                    {results.map((item) => (
                        <Link to={`/${item.tipus}/${item.id}`} key={`${item.tipus}-${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="search-result-card">
                                <div className="card-img-wrapper">
                                    <img src={item.poszter_url} alt={item.cim} />
                                </div>
                                <div className="search-card-info">
                                    <h4>{item.cim}</h4>
                                    <span>{item.ev} • {item.tipus === 'film' ? 'Film' : 'Sorozat'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <i className="fas fa-search" style={{ fontSize: '4rem', color: '#222', marginBottom: '20px' }}></i>
                    <h3 style={{ fontSize: '1.5rem', color: '#888' }}>Sajnos nem találtunk semmit a(z) "{query}" keresésre.</h3>
                </div>
            )}
            
        </div>
    );
}