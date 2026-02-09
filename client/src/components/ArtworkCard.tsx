import React from 'react';
import '../styles/artworkcard.css';

interface ArtworkCardProps {
  title: string;
  image: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  category?: string;
  price?: number;
  sold?: boolean;
}

export default function ArtworkCard({ 
  title, 
  image, 
  year, 
  medium, 
  dimensions, 
  price, 
  sold = false 
}: ArtworkCardProps) {
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <article className="artwork-card">
        <div className="image-container">
          <img src={image} alt={title} loading="lazy" />
          {sold && <div className="sold-badge">Verkauft</div>}
        </div>
        <div className="artwork-info">
          <h3>{title}</h3>
          <div className="artwork-meta">
            {year && <span>{year}</span>}
            {medium && <span>{medium}</span>}
            {dimensions && <span>{dimensions}</span>}
          </div>
          {price && (
      
            <div className="artwork-price">
              {sold ? (
                <span className="price-sold">Verkauft</span>
              ) : (
                <span className="price-amount">
                  €{price.toLocaleString('de-DE')}
                </span>
              )}
            </div>
          )}
        </div>
    </article>
  );
}