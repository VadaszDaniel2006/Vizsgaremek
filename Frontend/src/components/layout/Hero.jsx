import { useEffect } from 'react';
import './Hero.css';

export default function Hero({ movies, currentSlide, setCurrentSlide, onOpenTrailer, onOpenInfo, onOpenStreaming }) {
  
  // Automatikus léptetés logika
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length, setCurrentSlide]);

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % movies.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <section className="featured-section">
      <div className="movie-carousel">
        {movies.map((movie, index) => (
          <div key={movie.id} className={`movie-slide ${index === currentSlide ? 'active' : ''}`}>
            <div className="movie-content">
              <div className="movie-poster-large">
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-overlay">
                  <button className="play-btn" onClick={() => onOpenTrailer(movie.trailerId, movie.title)}>
                    <i className="fas fa-play"></i>
                  </button>
                </div>
              </div>
              <div className="movie-info">
                <h2>{movie.title} ({movie.year})</h2>
                <div className="movie-meta">
                  <span><i className="fas fa-star"></i> {movie.rating}</span>
                  <span>{movie.runtime}</span>
                  <span>{movie.genre}</span>
                </div>
                <p>{movie.description}</p>
                <div className="movie-actions">
                  <button className="btn-primary" onClick={() => onOpenStreaming(movie)}>
                    <i className="fas fa-play"></i> Megnézem
                  </button>
                  <button className="btn-secondary" onClick={() => onOpenInfo(movie)}>
                    <i className="fas fa-info-circle"></i> Részletek
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="carousel-controls">
          <button onClick={handlePrevSlide}><i className="fas fa-chevron-left"></i></button>
          <button onClick={handleNextSlide}><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </section>
  );
}