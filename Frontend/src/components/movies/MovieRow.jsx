import React from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ 
  title, 
  items, 
  user, 
  onOpenInfo, 
  onOpenTrailer, 
  onOpenStreaming, 
  onAddToFav, 
  onRemoveFromFav, 
  onAddToList, 
  onRemoveFromList, 
  onOpenReviews,
  interactionUpdate // <--- ÚJ: Ezt kell átvenni az App.jsx-től (a szinkronizáláshoz)
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="row-wrapper">
      <h2 className="row-header">{title}</h2>
      <div className="movies-grid">
        {items.map((item) => (
          <MovieCard 
            key={item.id} 
            movie={item} 
            user={user} 
            onOpenInfo={onOpenInfo}
            onOpenTrailer={onOpenTrailer}
            onOpenStreaming={onOpenStreaming}
            onAddToFav={onAddToFav}
            onRemoveFromFav={onRemoveFromFav}
            onAddToList={onAddToList}
            onRemoveFromList={onRemoveFromList}
            onOpenReviews={onOpenReviews}
            interactionUpdate={interactionUpdate} // <--- ÚJ: Továbbadjuk a kártyának
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow;