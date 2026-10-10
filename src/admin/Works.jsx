import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { deleteWork } from './deleteWork';
import {
  ALT_HINT,
  MAX_ALT_LENGTH,
  SIZE_OPTIONS,
  STYLE_OPTIONS,
} from './options';
import './works.css';

const PUBLISH_MESSAGE = 'Add alt text and a style before publishing.';
const FEATURED_WARNING =
  'The homepage shows four featured pieces. You can still mark this one.';
const CONFIRM_PREFIX = '[CONFIRM]';

function blank(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text : null;
}

function styleLabel(value) {
  return STYLE_OPTIONS.find((option) => option.value === value)?.label || value || 'Style';
}

function tileTitle(work) {
  if (work.title) return work.title;
  const parts = [work.series, work.character_name].filter(Boolean);
  return parts.join(' · ') || 'Untitled';
}

function publicUrl(path) {
  if (!path || !supabase) return '';
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
  return data?.publicUrl || '';
}

function formFromWork(work) {
  return {
    altText: work.alt_text || '',
    style: work.style || '',
    series: work.series || '',
    character: work.character_name || '',
    placement: work.placement || '',
    size: work.size || '',
    title: work.title || '',
    caption: work.caption || '',
    featured: Boolean(work.is_featured),
    sortOrder: String(work.sort_order ?? 0),
  };
}

function payloadFromForm(form) {
  const parsed = Number.parseInt(form.sortOrder, 10);
  return {
    alt_text: form.altText.trim(),
    style: form.style,
    title: blank(form.title),
    series: blank(form.series),
    character_name: blank(form.character),
    placement: blank(form.placement),
    size: form.size || null,
    caption: blank(form.caption),
    is_featured: Boolean(form.featured),
    sort_order: Number.isFinite(parsed) ? parsed : 0,
  };
}

function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('drafts');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [panelError, setPanelError] = useState('');
  const [panelMessage, setPanelMessage] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState({});
  const [review, setReview] = useState(null);

  useEffect(() => {
    document.title = 'Manage pieces | Lyfestyle Tattoos';
  }, []);

  async function loadWorks() {
    if (!supabase) {
      setLoadError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(error.message || "Couldn't load pieces.");
      setLoading(false);
      return;
    }
    setWorks(data || []);
    setLoadError('');
    setLoading(false);
  }

  useEffect(() => {
    loadWorks();
  }, []);

  const seriesOptions = useMemo(() => {
    return [...new Set(works.map((work) => work.series).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [works]);

  const drafts = works.filter((work) => !work.is_published);
  const published = works.filter((work) => work.is_published);
  const selected = works.find((work) => work.id === selectedId) || null;

  const visible = useMemo(() => {
    let list = tab === 'drafts' ? drafts : tab === 'published' ? published : works;
    if (seriesFilter) list = list.filter((work) => work.series === seriesFilter);
    if (styleFilter) list = list.filter((work) => work.style === styleFilter);
    const needle = query.trim().toLowerCase();
    if (needle) {
      list = list.filter((work) =>
        [work.title, work.character_name, work.caption].some((value) =>
          (value || '').toLowerCase().includes(needle)
        )
      );
    }
    return list;
  }, [tab, drafts, published, works, seriesFilter, styleFilter, query]);

  const otherFeatured = works.filter(
    (work) => work.is_featured && work.id !== selectedId
  ).length;
  const featuredWarning = Boolean(form?.featured) && otherFeatured >= 4;

  function openWork(work) {
    setSelectedId(work.id);
    setForm(formFromWork(work));
    setPanelError('');
    setPanelMessage('');
    setConfirmingDelete(false);
    setReview(null);
  }

  function closePanel() {
    setSelectedId(null);
    setForm(null);
    setPanelError('');
    setPanelMessage('');
    setConfirmingDelete(false);
  }

  function replaceWork(next) {
    setWorks((current) => current.map((work) => (work.id === next.id ? next : work)));
  }

  async function saveFields() {
    if (!supabase || !selected || !form) return { ok: false };
    if (!form.altText.trim() || !form.style) {
      setPanelError('Alt text and a style are required.');
      return { ok: false };
    }
    return updateSelected(payloadFromForm(form), 'Saved.');
  }

  async function publishSelected() {
    if (!form?.altText.trim() || !form?.style) {
      setPanelError(PUBLISH_MESSAGE);
      return;
    }
    await updateSelected({ ...payloadFromForm(form), is_published: true }, 'Published.');
  }

  async function unpublishSelected() {
    const changes = { is_published: false };
    if (form?.altText.trim() && form?.style) {
      Object.assign(changes, payloadFromForm(form), { is_published: false });
    }
    await updateSelected(changes, 'Unpublished.');
  }

  async function updateSelected(changes, message) {
    if (!supabase || !selected) return { ok: false };
    setBusy(true);
    setPanelError('');
    const { data, error } = await supabase
      .from('works')
      .update(changes)
      .eq('id', selected.id)
      .select('*')
      .single();
    setBusy(false);
    if (error) {
      setPanelError(error.message || "Couldn't save this piece.");
      return { ok: false };
    }
    replaceWork(data);
    setForm(formFromWork(data));
    setPanelMessage(message);
    return { ok: true, work: data };
  }

  async function removeSelected() {
    if (!supabase || !selected) return;
    setBusy(true);
    setPanelError('');
    const result = await deleteWork(supabase, selected);
    setBusy(false);
    if (!result.ok) {
      setPanelError(result.error);
      setConfirmingDelete(false);
      return;
    }
    setWorks((current) => current.filter((work) => work.id !== selected.id));
    closePanel();
  }

  function startReview() {
    const queue = works.filter((work) => !work.is_published);
    setReview({ queue, index: 0 });
    closePanel();
  }

  async function reviewPublish() {
    const current = review?.queue[review.index];
    if (!current) return;
    if (!current.alt_text?.trim() || !current.style) {
      setReview({ ...review, error: PUBLISH_MESSAGE });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from('works')
      .update({ is_published: true })
      .eq('id', current.id)
      .select('*')
      .single();
    setBusy(false);
    if (error) {
      setReview({ ...review, error: error.message || "Couldn't publish this piece." });
      return;
    }
    replaceWork(data);
    setReview({ ...review, index: review.index + 1, error: '' });
  }

  function reviewSkip() {
    setReview({ ...review, index: review.index + 1, error: '' });
  }

  async function reviewNeedsClyde() {
    const current = review?.queue[review.index];
    if (!current || !supabase) return;
    const existing = current.caption || '';
    const caption = existing.startsWith(CONFIRM_PREFIX)
      ? existing
      : existing
        ? `${CONFIRM_PREFIX} ${existing}`
        : CONFIRM_PREFIX;
    setBusy(true);
    const { data, error } = await supabase
      .from('works')
      .update({ caption, is_published: false })
      .eq('id', current.id)
      .select('*')
      .single();
    setBusy(false);
    if (error) {
      setReview({ ...review, error: error.message || "Couldn't update this piece." });
      return;
    }
    replaceWork(data);
    setReview({
      ...review,
      queue: review.queue.map((work) => (work.id === data.id ? data : work)),
      index: review.index + 1,
      error: '',
    });
  }

  const reviewItem = review && review.index < review.queue.length ? review.queue[review.index] : null;

  return (
    <div className="admin-works">
      <header className="admin-header">
        <div>
          <p className="admin-studio">Manage pieces</p>
          <Link className="admin-back" to="/admin">
            Back to admin
          </Link>
        </div>
      </header>

      <div className="admin-tabs" role="tablist">
        {[
          ['drafts', 'Drafts', drafts.length],
          ['published', 'Published', published.length],
          ['all', 'All', works.length],
        ].map(([id, label, count]) => (
          <button
            key={id}
            className={tab === id ? 'admin-tab is-active' : 'admin-tab'}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <button
        className="admin-button"
        type="button"
        onClick={startReview}
        disabled={drafts.length === 0}
      >
        Review drafts
      </button>

      <div className="admin-filters">
        <label htmlFor="works-series">Series</label>
        <select
          id="works-series"
          className="admin-input"
          value={seriesFilter}
          onChange={(event) => setSeriesFilter(event.target.value)}
        >
          <option value="">All series</option>
          {seriesOptions.map((series) => (
            <option key={series} value={series}>
              {series}
            </option>
          ))}
        </select>
        <label htmlFor="works-style">Style</label>
        <select
          id="works-style"
          className="admin-input"
          value={styleFilter}
          onChange={(event) => setStyleFilter(event.target.value)}
        >
          <option value="">All styles</option>
          {STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor="works-search">Search</label>
        <input
          id="works-search"
          className="admin-input"
          type="search"
          value={query}
          placeholder="Title, character, or caption"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? <p className="admin-lead">Loading</p> : null}
      {loadError ? (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      ) : null}
      {!loading && !loadError && visible.length === 0 ? (
        <p className="admin-lead">No pieces in this view.</p>
      ) : null}

      <div className="admin-grid">
        {visible.map((work) => {
          const src = brokenThumbs[work.id] ? '' : publicUrl(work.thumb_path);
          return (
            <button
              className="admin-tile"
              type="button"
              key={work.id}
              onClick={() => openWork(work)}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() =>
                    setBrokenThumbs((current) => ({ ...current, [work.id]: true }))
                  }
                />
              ) : (
                <span className="admin-thumb-missing">No thumbnail</span>
              )}
              <span className="admin-tile-copy">
                <span className="admin-tile-title">{tileTitle(work)}</span>
                <span className="admin-tile-style">{styleLabel(work.style)}</span>
                <span className="admin-chips">
                  <span className="admin-chip">
                    {work.is_published ? 'Published' : 'Draft'}
                  </span>
                  {work.is_featured ? <span className="admin-chip">★ Featured</span> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected && form ? (
        <div className="admin-panel-root">
          <button className="admin-panel-backdrop" type="button" aria-label="Close" onClick={closePanel} />
          <section className="admin-panel" role="dialog" aria-label="Edit piece">
            <div className="admin-panel-body">
              {publicUrl(selected.image_path) ? (
                <img
                  className="admin-panel-preview"
                  src={publicUrl(selected.image_path)}
                  alt={form.altText || tileTitle(selected)}
                />
              ) : (
                <div className="admin-thumb-missing">No thumbnail</div>
              )}
              <label htmlFor="edit-alt">Alt text</label>
              <input
                id="edit-alt"
                className="admin-input"
                maxLength={MAX_ALT_LENGTH}
                value={form.altText}
                aria-describedby="edit-alt-hint"
                onChange={(event) => setForm({ ...form, altText: event.target.value })}
              />
              <p className="admin-hint" id="edit-alt-hint">
                {ALT_HINT}
              </p>
              <label htmlFor="edit-style">Style</label>
              <select
                id="edit-style"
                className="admin-input"
                value={form.style}
                onChange={(event) => setForm({ ...form, style: event.target.value })}
              >
                <option value="">Select a style</option>
                {STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="edit-series">Series</label>
              <input
                id="edit-series"
                className="admin-input"
                list="edit-series-options"
                value={form.series}
                onChange={(event) => setForm({ ...form, series: event.target.value })}
              />
              <datalist id="edit-series-options">
                {seriesOptions.map((series) => (
                  <option key={series} value={series} />
                ))}
              </datalist>
              <label htmlFor="edit-character">Character</label>
              <input
                id="edit-character"
                className="admin-input"
                value={form.character}
                onChange={(event) => setForm({ ...form, character: event.target.value })}
              />
              <label htmlFor="edit-placement">Placement</label>
              <input
                id="edit-placement"
                className="admin-input"
                value={form.placement}
                onChange={(event) => setForm({ ...form, placement: event.target.value })}
              />
              <label htmlFor="edit-size">Size</label>
              <select
                id="edit-size"
                className="admin-input"
                value={form.size}
                onChange={(event) => setForm({ ...form, size: event.target.value })}
              >
                <option value="">Size</option>
                {SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                className="admin-input"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <label htmlFor="edit-caption">Caption</label>
              <textarea
                id="edit-caption"
                className="admin-input admin-textarea"
                value={form.caption}
                onChange={(event) => setForm({ ...form, caption: event.target.value })}
              />
              <label className="admin-check" htmlFor="edit-featured">
                <input
                  id="edit-featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                />
                Feature on homepage
              </label>
              {featuredWarning ? <p className="admin-warning">{FEATURED_WARNING}</p> : null}
              <label htmlFor="edit-sort">Sort order</label>
              <input
                id="edit-sort"
                className="admin-input"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
              />
              {panelError ? (
                <p className="admin-error" role="alert">
                  {panelError}
                </p>
              ) : null}
              {panelMessage ? <p className="admin-status is-saved">{panelMessage}</p> : null}
            </div>
            <div className="admin-panel-actions">
              {confirmingDelete ? (
                <>
                  <p>Delete this piece and its photos?</p>
                  <button className="admin-button" type="button" disabled={busy} onClick={removeSelected}>
                    Confirm delete
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="admin-button"
                    type="button"
                    disabled={busy}
                    onClick={publishSelected}
                  >
                    Publish
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    disabled={busy}
                    onClick={unpublishSelected}
                  >
                    Unpublish
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    disabled={busy}
                    onClick={saveFields}
                  >
                    Save
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setPanelError('');
                      setConfirmingDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {review ? (
        <div className="admin-review">
          {reviewItem ? (
            <>
              <p className="admin-review-progress">
                {review.index + 1} of {review.queue.length}
              </p>
              {publicUrl(reviewItem.image_path || reviewItem.thumb_path) ? (
                <img
                  className="admin-review-image"
                  src={publicUrl(reviewItem.image_path || reviewItem.thumb_path)}
                  alt={reviewItem.alt_text || tileTitle(reviewItem)}
                />
              ) : (
                <div className="admin-thumb-missing">No thumbnail</div>
              )}
              <dl className="admin-review-fields">
                <div>
                  <dt>Alt text</dt>
                  <dd>{reviewItem.alt_text || 'Missing'}</dd>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>{styleLabel(reviewItem.style)}</dd>
                </div>
                <div>
                  <dt>Series</dt>
                  <dd>{reviewItem.series || '—'}</dd>
                </div>
                <div>
                  <dt>Character</dt>
                  <dd>{reviewItem.character_name || '—'}</dd>
                </div>
                <div>
                  <dt>Placement</dt>
                  <dd>{reviewItem.placement || '—'}</dd>
                </div>
                <div>
                  <dt>Title</dt>
                  <dd>{reviewItem.title || '—'}</dd>
                </div>
                <div>
                  <dt>Caption</dt>
                  <dd>{reviewItem.caption || '—'}</dd>
                </div>
              </dl>
              {review.error ? (
                <p className="admin-error" role="alert">
                  {review.error}
                </p>
              ) : null}
              <div className="admin-panel-actions">
                <button className="admin-button" type="button" disabled={busy} onClick={reviewPublish}>
                  Publish
                </button>
                <button className="admin-button admin-button-quiet" type="button" disabled={busy} onClick={reviewSkip}>
                  Skip
                </button>
                <button
                  className="admin-button admin-button-quiet"
                  type="button"
                  disabled={busy}
                  onClick={reviewNeedsClyde}
                >
                  Needs Clyde
                </button>
              </div>
            </>
          ) : (
            <div className="admin-review-done">
              <p>Reviewed {review.queue.length} drafts.</p>
              <button className="admin-button" type="button" onClick={() => setReview(null)}>
                Back to pieces
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Works;
