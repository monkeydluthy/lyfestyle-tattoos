import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { workImageUrl } from '../lib/works';

function credit(work) {
  return [work.series, work.character_name].filter(Boolean).join(' · ');
}

function WorkLightbox({ work, onClose, onStep }) {
  const dialogRef = useRef(null);
  const touchX = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !work) return undefined;
    if (!dialog.open) dialog.showModal();
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onStep(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onStep(1);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [work, onClose, onStep]);

  if (!work) return null;

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={work.title || 'Tattoo'}
      onClose={onClose}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        if (delta > 40) onStep(-1);
        if (delta < -40) onStep(1);
        touchX.current = null;
      }}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <button type="button" className="lightbox-nav lightbox-prev" onClick={() => onStep(-1)} aria-label="Previous">
        ←
      </button>
      <button type="button" className="lightbox-nav lightbox-next" onClick={() => onStep(1)} aria-label="Next">
        →
      </button>
      <div className="lightbox-photo">
        <img
          src={workImageUrl(work.image_path)}
          alt={work.alt_text || work.title || ''}
          width={360}
          height={480}
        />
      </div>
      <div className="lightbox-copy">
        <h2>{work.title || 'Untitled'}</h2>
        {credit(work) ? <p>{credit(work)}</p> : null}
        <Link className="lightbox-like" to={`/?ref=${work.id}#start`} onClick={onClose}>
          I want something like this
        </Link>
      </div>
    </dialog>
  );
}

export default WorkLightbox;
