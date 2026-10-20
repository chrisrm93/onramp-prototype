// Photo gallery for a listing: one big photo plus a scrollable strip of thumbnails to switch it.
import { useState } from 'react'

export default function PhotoGallery({ photos, alt }) {
  const [current, setCurrent] = useState(0)

  if (photos.length === 0) {
    return <div className="gallery-empty">Photos coming soon</div>
  }

  // Step forward or back through the photos, wrapping around at the ends.
  function step(delta) {
    setCurrent((i) => (i + delta + photos.length) % photos.length)
  }

  return (
    <section className="gallery">
      <div className="gallery-main">
        <img src={photos[current]} alt={`${alt} photo ${current + 1}`} />
        <button className="gallery-arrow left" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
        <button className="gallery-arrow right" onClick={() => step(1)} aria-label="Next photo">›</button>
        <span className="gallery-count">{current + 1} / {photos.length}</span>
      </div>
      <div className="gallery-thumbs">
        {photos.map((src, i) => (
          <button
            key={src}
            className={i === current ? 'thumb active' : 'thumb'}
            onClick={() => setCurrent(i)}
            aria-label={`Show photo ${i + 1}`}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  )
}
