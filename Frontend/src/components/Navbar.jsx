import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import logoImg from '../logo.png'; 
import ProfilDropdown from './ProfilDropdown';

export default function Navbar({ scrolled, user, onOpenAuth, onLogout, onUpdateProfile, onOpenFavorites, onOpenMyList }) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('mozipont_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();
  const searchRef = useRef(null); 

  const toggleSearch = () => {
    if (searchActive) {
      setSearchActive(false);
      setIsInputFocused(false);
      setSearchValue('');
      setSearchResults([]);
    } else {
      setSearchActive(true);
      setTimeout(() => setIsInputFocused(true), 100);
    }
  };

  const saveToHistory = (term) => {
    if (!term.trim()) return;
    let newHistory = searchHistory.filter(item => item !== term);
    newHistory.unshift(term);
    if (newHistory.length > 5) newHistory.pop();
    setSearchHistory(newHistory);
    localStorage.setItem('mozipont_search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (termToRemove, e) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(item => item !== termToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('mozipont_search_history', JSON.stringify(newHistory));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchValue.trim().length > 0) {
        try {
          const res = await fetch(`http://localhost:5000/api/search?q=${searchValue}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (error) { console.error(error); }
      } else {
        setSearchResults([]); 
      }
    }, 300); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const handleResultClick = (item) => {
    saveToHistory(item.cim);
    navigate(`/${item.tipus}/${item.id}`);
    toggleSearch(); 
  };

  const handleHistoryClick = (term) => {
      saveToHistory(term);
      toggleSearch(); 
      navigate(`/kereses?q=${term}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim().length > 0) {
      saveToHistory(searchValue.trim());
      setSearchResults([]);
      setSearchActive(false);
      navigate(`/kereses?q=${searchValue}`);
      setSearchValue('');
      setIsInputFocused(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasHistory = searchValue.trim() === '' && searchHistory.length > 0;
  const hasResults = searchResults.length > 0;
  const showDropdown = isInputFocused && searchActive && (hasHistory || hasResults);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="nav-container">
        <div className="nav-left">
            <Link to="/" className="logo-link"><div className="logo"><img src={logoImg} alt="MoziPont Logo" /></div></Link>
            <ul className="nav-links">
                <li><Link to="/">Kezdőlap</Link></li>
                {/* ÚJ LINKEK ITT */}
                <li><Link to="/top-50-filmek">Top 50 Film</Link></li>
                <li><Link to="/top-50-sorozatok">Top 50 Sorozat</Link></li>
                
            </ul>
        </div>

        <div className="nav-right">
            <div className={`search-box-capsule ${searchActive ? 'active' : ''}`} ref={searchRef}>
                <button className="search-btn-icon" onClick={toggleSearch}>
                    <i className="fas fa-search"></i>
                </button>
                <input 
                    type="text" 
                    placeholder="Címek, emberek, műfajok..." 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown} 
                    onFocus={() => setIsInputFocused(true)}
                />
                
                {showDropdown && (
                    <div className="search-dropdown-modern">
                        {hasHistory ? (
                            <div className="history-section">
                                <div className="dropdown-header">Legutóbbi keresések</div>
                                {searchHistory.map((term, index) => (
                                    <div key={index} className="dropdown-item" onClick={() => handleHistoryClick(term)}>
                                        <div className="item-content">
                                            <i className="fas fa-history"></i>
                                            <span>{term}</span>
                                        </div>
                                        <i className="fas fa-times delete-btn" onClick={(e) => removeFromHistory(term, e)}></i>
                                    </div>
                                ))}
                            </div>
                        ) : hasResults ? (
                            <div className="results-section">
                                {searchResults.map(item => (
                                    <div key={`${item.tipus}-${item.id}`} className="dropdown-item" onClick={() => handleResultClick(item)}>
                                        <img src={item.poszter_url} alt={item.cim} />
                                        <div className="item-info">
                                            <span className="item-title">{item.cim}</span>
                                            <span className="item-meta">{item.ev} • {item.tipus === 'film' ? 'Film' : 'Sorozat'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
            
            {user ? ( <ProfilDropdown user={user} onLogout={onLogout} onOpenProfile={onUpdateProfile} onOpenFavorites={onOpenFavorites} onOpenMyList={onOpenMyList} /> ) : ( <button className="btn-login" onClick={onOpenAuth}>Bejelentkezés</button> )}
        </div>
      </div>
    </nav>
  );
}