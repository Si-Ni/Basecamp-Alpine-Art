// components/WorksGallery.tsx
import React, { useState, useMemo } from 'react';
import ArtworkCard from './ArtworkCard';

interface Artwork {
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
  tags: string[];
}

interface WorksGalleryProps {
  artworks: Artwork[];
}

export default function WorksGallery({ artworks }: WorksGalleryProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentCategoryFilter, setContentCategoryFilter] = useState('all');
  const [mediumFilter, setMediumFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'year-desc' | 'year-asc' | 'price-asc' | 'price-desc'>('none');

  // Extract unique values for filter options
  const categories = useMemo(() => 
    [...new Set(artworks.map(a => a.category))], 
    [artworks]
  );
  
  const mediums = useMemo(() => 
    [...new Set(artworks.map(a => a.medium))], 
    [artworks]
  );
  
  const contentCategories = useMemo(() => 
    [...new Set(artworks.map(a => a.contentCategory))], 
    [artworks]
  );

  // Filter and sort artworks
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = artworks.filter((artwork) => {
      const matchesCategory = categoryFilter === 'all' || artwork.category === categoryFilter;
      const matchesContentCategory = contentCategoryFilter === 'all' || artwork.contentCategory === contentCategoryFilter;
      const matchesMedium = mediumFilter === 'all' || artwork.medium === mediumFilter;
      const matchesFormat = formatFilter === 'all' || artwork.format === formatFilter;
      const matchesAvailability = !availableOnly || !artwork.sold;
      
      const searchableText = `${artwork.title} ${artwork.tags.join(' ')} ${artwork.dimensions}`.toLowerCase();
      const matchesSearch = searchInput === '' || searchableText.includes(searchInput.toLowerCase());

      return matchesCategory && matchesContentCategory && matchesMedium && 
             matchesFormat && matchesAvailability && matchesSearch;
    });

    // Sort
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'year-desc':
            return parseInt(b.year) - parseInt(a.year);
          case 'year-asc':
            return parseInt(a.year) - parseInt(b.year);
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [artworks, categoryFilter, contentCategoryFilter, mediumFilter, formatFilter, searchInput, availableOnly, sortBy]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setContentCategoryFilter('all');
    setMediumFilter('all');
    setFormatFilter('all');
    setSearchInput('');
    setAvailableOnly(false);
    setSortBy('none');
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'painting': return 'Malerei';
      case 'abstract': return 'Abstrakt';
      case 'digital': return 'Digital';
      default: return category;
    }
  };

  const getContentCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'flowers': return 'Blumen';
      case 'mountains': return 'Berge';
      default: return cat;
    }
  };

  const resultsText = useMemo(() => {
    const totalCount = artworks.length;
    const visibleCount = filteredAndSortedArtworks.length;
    
    const hasActiveFilters = categoryFilter !== 'all' || contentCategoryFilter !== 'all' || 
                            mediumFilter !== 'all' || formatFilter !== 'all' || 
                            searchInput !== '' || availableOnly || sortBy !== 'none';

    if (!hasActiveFilters) {
      return `Alle ${totalCount} Werke werden angezeigt`;
    }
    return `${visibleCount} von ${totalCount} Werken werden angezeigt`;
  }, [artworks.length, categoryFilter, contentCategoryFilter, mediumFilter, formatFilter, searchInput, availableOnly, sortBy, filteredAndSortedArtworks.length]);

  return (
    <>
      <div className="filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="category-filter">Kategorie:</label>
            <select 
              id="category-filter" 
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Alle Kategorien</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="content-category-filter">Inhalt:</label>
            <select 
              id="content-category-filter" 
              className="filter-select"
              value={contentCategoryFilter}
              onChange={(e) => setContentCategoryFilter(e.target.value)}
            >
              <option value="all">Alle Inhalte</option>
              {contentCategories.map(cat => (
                <option key={cat} value={cat}>
                  {getContentCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="medium-filter">Medium:</label>
            <select 
              id="medium-filter" 
              className="filter-select"
              value={mediumFilter}
              onChange={(e) => setMediumFilter(e.target.value)}
            >
              <option value="all">Alle Medien</option>
              {mediums.map(medium => (
                <option key={medium} value={medium}>{medium}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="format-filter">Format:</label>
            <select 
              id="format-filter" 
              className="filter-select"
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
            >
              <option value="all">Alle Formate</option>
              <option value="vertical">Vertikal</option>
              <option value="horizontal">Horizontal</option>
              <option value="square">Quadratisch</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group search-group">
            <label htmlFor="search-input">Suche:</label>
            <input 
              type="text" 
              id="search-input" 
              className="filter-input" 
              placeholder="Suche nach Titel, Tags, Größe..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="filter-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                id="available-only"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              <span>Nur Verfügbare</span>
            </label>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sortieren nach:</label>
            <select 
              id="sort-by" 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="none">Keine Sortierung</option>
              <option value="year-desc">Jahr (Neueste zuerst)</option>
              <option value="year-asc">Jahr (Älteste zuerst)</option>
              <option value="price-asc">Preis (Niedrigste zuerst)</option>
              <option value="price-desc">Preis (Höchste zuerst)</option>
            </select>
          </div>

          <button 
            id="reset-filters" 
            className="reset-button"
            onClick={resetFilters}
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      <div className="results-count">
        {resultsText}
      </div>

      <section className="gallery">
        {filteredAndSortedArtworks.map((artwork) => (
          <ArtworkCard key={artwork.title} {...artwork} />
        ))}
      </section>

      {filteredAndSortedArtworks.length === 0 && (
        <div className="no-results">
          <p>Keine Kunstwerke entsprechen Ihren Filterkriterien.</p>
          <button className="reset-button" onClick={resetFilters}>
            Filter löschen
          </button>
        </div>
      )}
    </>
  );
}