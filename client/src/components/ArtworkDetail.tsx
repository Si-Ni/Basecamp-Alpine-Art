// components/ArtworkDetail.tsx
import React from 'react';
import '../styles/artworkdetail.css';

interface Artwork {
  slug: string;
  title: string;
  image: string;
  year: string;
  medium: string;
  dimensions: string;
  category: string;
  contentCategory: string;
  format: string;
  price: number;
  sold: boolean;
  description: string;
  tags: string[];
}

interface ArtworkDetailProps {
  artwork: Artwork;
}

export default function ArtworkDetail({ artwork }: ArtworkDetailProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'painting': return 'Malerei';
      case 'abstract': return 'Abstrakt';
      case 'digital': return 'Digital';
      default: return category;
    }
  };

  const getContentCategoryLabel = (cat: string) => {
    return cat === 'flowers' ? 'Blumen' : 'Berge';
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'vertical': return 'Vertikal';
      case 'horizontal': return 'Horizontal';
      case 'square': return 'Quadratisch';
      default: return format;
    }
  };

  return (
    <article className="artwork-detail">
      <div className="artwork-images">
        <div className="main-image">
          <img src={artwork.image} alt={artwork.title} />
          {artwork.sold && <div className="sold-badge">Verkauft</div>}
        </div>
      </div>

      <div className="artwork-content">
        <div className="artwork-header">
          <h1>{artwork.title}</h1>
          <div className="artwork-meta">
            <span>{artwork.year}</span>
            <span>{artwork.medium}</span>
            <span>{artwork.dimensions}</span>
          </div>
        </div>

        <div className="artwork-price-section">
          {artwork.sold ? (
            <div className="price sold">
              <span className="label">Status:</span>
              <span className="value">Verkauft</span>
            </div>
          ) : (
            <div className="price">
              <span className="label">Preis:</span>
              <span className="value">
                €{artwork.price.toLocaleString('de-DE')}
              </span>
            </div>
          )}
        </div>

        <div className="artwork-description">
          <h2>Über dieses Werk</h2>
          <p>{artwork.description}</p>
        </div>

        <div className="artwork-details">
          <h2>Details</h2>
          <dl>
            <dt>Kategorie</dt>
            <dd>{getCategoryLabel(artwork.category)}</dd>
            
            <dt>Motiv</dt>
            <dd>{getContentCategoryLabel(artwork.contentCategory)}</dd>
            
            <dt>Format</dt>
            <dd>{getFormatLabel(artwork.format)}</dd>
            
            <dt>Medium</dt>
            <dd>{artwork.medium}</dd>
            
            <dt>Abmessungen</dt>
            <dd>{artwork.dimensions}</dd>
            
            <dt>Jahr</dt>
            <dd>{artwork.year}</dd>
          </dl>
        </div>

        {!artwork.sold && (
          <div className="artwork-actions">
            <a href="/contact" className="contact-button">
              Kaufanfrage stellen
            </a>
          </div>
        )}

        <div className="back-link">
          <a href="/works">← Zurück zu allen Werken</a>
        </div>
      </div>
    </article>
  );
}