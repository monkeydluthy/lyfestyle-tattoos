import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sizeLabel, slugify, styleLabel, workImageUrl } from '../lib/works';
import './work.css';

const PAGE_SIZE = 24;
const FILTERS = [
  { key: 'series', label: 'Series', field: 'series', slug: true },
  { key: 'style', label: 'Style', field: 'style', slug: false },
  { key: 'placement', label: 'Placement', field: 'placement', slug: false },
  { key: 'size', label: 'Size', field: 'size', slug: false },
];

function chipLabel(group, value) {
  if (group.key === 'style') return styleLabel(value);
  if (group.key === 'size') return sizeLabel(value);
  return value;
}

function distinctValues(works, field) {
  return [...new Set(works.map((work) => work[field]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function paramValue(group, value) {
  return group.slug ? slugify(value) : value;
}

function matchedValue(works, group, param) {
  if (!param) return '';
  const values = distinctValues(works, group.field);
  const found = values.find((value) => paramValue(group, value) === param);
  return found || '';
}

function credit(work) {
  return [work.series, work.character_name].filter(Boolean).join(' · ');
}

function WorkGallery({ works }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const touchX = useRef(null);

  const groups = useMemo(
    () =>
      FILTERS.map((group) => ({
        ...group,
        values: distinctValues(works, group.field),
      })).filter((group) => group.values.length >= 2),
    [works]
  );

  const selected = useMemo(() => {
    const next = {};
    groups.forEach((group) => {
      next[group.key] = matchedValue(works, group, searchParams.get(group.key) || '');
    });
    return next;
  }, [groups, searchParams, works]);

  const filtered = useMemo(
    () =>
      works.filter((work) =>
        groups.every((group) => {
          const value = selected[group.key];
          return !value || work[group.field] === value;
        })
      ),
    [groups, selected, works]
  );

  const shown = filtered.slice(0, visibleCount);
  const openWork = openIndex == null ? null : filtered[openIndex] || null;
  const query = searchParams.toString();

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setOpenIndex(null);
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || openIndex == null) return undefined;
    if (!dialog.open) dialog.showModal();
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, filtered.length]);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    FILTERS.forEach((group) => next.delete(group.key));
    setSearchParams(next);
  }

  function openAt(index, button) {
    triggerRef.current = button;
    setOpenIndex(index);
  }

  function closeDialog() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setOpenIndex(null);
    triggerRef.current?.focus();
  }

  function step(direction) {
    if (!filtered.length) return;
    setOpenIndex((current) => {
      const start = current == null ? 0 : current;
      return (start + direction + filtered.length) % filtered.length;
    });
  }

  return (
    <section className="work-gallery" id="work">
      <h2>The work</h2>
      {groups.map((group) => (
        <div className="work-group" key={group.key}>
          <p>{group.label}</p>
          <div className="work-chips">
            <button
              type="button"
              className="work-chip"
              aria-pressed={!selected[group.key]}
              onClick={() => setFilter(group.key, '')}
            >
              All
            </button>
            {group.values.map((value) => (
              <button
                key={value}
                type="button"
                className="work-chip"
                aria-pressed={selected[group.key] === value}
                onClick={() => setFilter(group.key, paramValue(group, value))}
              >
                {chipLabel(group, value)}
              </button>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 ? (
        <div className="work-empty">
          <p>No pieces match these filters.</p>
          <button type="button" className="work-clear" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="work-grid">
            {shown.map((work, index) => (
              <button
                key={work.id}
                type="button"
                className="work-tile"
                onClick={(event) => openAt(index, event.currentTarget)}
              >
                <img
                  src={workImageUrl(work.thumb_path)}
                  alt={work.alt_text || work.title || 'Tattoo'}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          {shown.length < filtered.length ? (
            <button
              type="button"
              className="work-more"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Load more
            </button>
          ) : null}
        </>
      )}

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={openWork?.title || 'Tattoo'}
        onClose={() => {
          setOpenIndex(null);
          triggerRef.current?.focus();
        }}
        onTouchStart={(event) => {
          touchX.current = event.changedTouches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchX.current == null) return;
          const delta = event.changedTouches[0].clientX - touchX.current;
          if (delta > 40) step(-1);
          if (delta < -40) step(1);
          touchX.current = null;
        }}
      >
        {openWork ? (
          <>
            <button type="button" className="lightbox-close" onClick={closeDialog} aria-label="Close">
              ×
            </button>
            <button type="button" className="lightbox-nav lightbox-prev" onClick={() => step(-1)} aria-label="Previous">
              ←
            </button>
            <button type="button" className="lightbox-nav lightbox-next" onClick={() => step(1)} aria-label="Next">
              →
            </button>
            <div className="lightbox-photo">
              <img src={workImageUrl(openWork.image_path)} alt={openWork.alt_text || openWork.title || ''} />
            </div>
            <div className="lightbox-copy">
              <h2>{openWork.title || 'Untitled'}</h2>
              {credit(openWork) ? <p>{credit(openWork)}</p> : null}
              <Link className="lightbox-like" to={`/?ref=${openWork.id}#start`} onClick={closeDialog}>
                I want something like this
              </Link>
            </div>
          </>
        ) : null}
      </dialog>
    </section>
  );
}

export default WorkGallery;
