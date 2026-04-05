import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, title, items, onItemClick, onDeleteItem }) => {
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemClick = (item) => {
      const isMovie = !!item.film_id;

      const normalizedMovie = {

          id: isMovie ? item.film_id : item.sorozat_id,
          _id: isMovie ? item.film_id : item.sorozat_id,

          cim: isMovie ? item.film_cim : item.sorozat_cim,
          title: isMovie ? item.film_cim : item.sorozat_cim,
          poszter_url: isMovie ? item.film_poster : item.sorozat_poster,
          poster: isMovie ? item.film_poster : item.sorozat_poster,

          leiras: isMovie ? item.film_leiras : item.sorozat_leiras,
          rating: isMovie ? item.film_rating : item.sorozat_rating,
          megjelenes_ev: isMovie ? item.film_ev : item.sorozat_ev,
          year: isMovie ? item.film_ev : item.sorozat_ev,

          platformok: item.platformok || [],

          type: isMovie ? 'film' : 'sorozat',
          ...item
      };

      if (onItemClick) {
          onItemClick(normalizedMovie);
      }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h3>{title}</h3>
            <button className="close-sidebar-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        <div className="sidebar-content">
            {safeItems.length === 0 ? (
                <p className="empty-msg">A lista jelenleg üres.</p>
            ) : (
                safeItems.map((item) => {
                    const displayTitle = item.film_cim || item.sorozat_cim || "Névtelen";
                    const displayPoster = item.film_poster || item.sorozat_poster || "https://via.placeholder.com/100x150";
                    const type = item.film_id ? "Film" : "Sorozat";
                    const uniqueKey = item.id || Math.random(); 

                    return (
                        <div key={uniqueKey} className="sidebar-item">
                            <div className="sidebar-item-clickable" onClick={() => handleItemClick(item)}>
                                <img 
                                    src={displayPoster} 
                                    alt={displayTitle} 
                                    onError={(e) => e.target.src='https://via.placeholder.com/100x150'} 
                                />
                                <div className="sidebar-item-info">
                                    <h4>{displayTitle}</h4>
                                    <span className="item-type">{type}</span>
                                    {item.added_at && (
                                        <span className="item-date">{new Date(item.added_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                className="sidebar-delete-btn"
                                onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                                title="Eltávolítás"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;