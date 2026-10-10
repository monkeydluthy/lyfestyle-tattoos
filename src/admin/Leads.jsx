import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { deleteLead, referenceObjectPath } from './deleteLead';
import { LEAD_STATUSES, leadStatusLabel } from './leadOptions';
import './leads.css';

const SIGNED_URL_SECONDS = 5 * 60;

const DETAIL_FIELDS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['idea', 'Idea'],
  ['placement', 'Placement'],
  ['size', 'Size'],
  ['style', 'Style'],
  ['budget', 'Budget'],
  ['timing', 'Timing'],
  ['quote_amount', 'Quote'],
  ['deposit_paid', 'Deposit paid'],
  ['source', 'Source'],
];

function summary(lead) {
  return [lead.idea, lead.placement, lead.size].filter(Boolean).join(' · ');
}

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function displayValue(lead, key) {
  const value = lead[key];
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'deposit_paid') return value ? 'Yes' : 'No';
  if (key === 'quote_amount') return `$${value}`;
  return String(value);
}

function phoneHref(phone) {
  const compact = String(phone).replace(/[^\d+]/g, '');
  return compact ? `tel:${compact}` : '';
}

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const selected = leads.find((lead) => lead.id === selectedId) || null;

  useEffect(() => {
    document.title = 'Leads | Lyfestyle Tattoos';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) {
        setLoadError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setLoadError(error.message || "Couldn't load leads.");
        setLoading(false);
        return;
      }
      setLeads(data || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function signPhotos() {
      setPhotos([]);
      setPhotoError('');
      if (!supabase || !selected) return;
      const paths = (selected.reference_paths || []).map(referenceObjectPath).filter(Boolean);
      if (paths.length === 0) return;
      const { data, error } = await supabase.storage
        .from('lead-references')
        .createSignedUrls(paths, SIGNED_URL_SECONDS);
      if (cancelled) return;
      if (error) {
        setPhotoError(error.message || "Couldn't open the reference photos.");
        return;
      }
      const failed = (data || []).find((item) => item.error);
      if (failed) {
        setPhotoError(failed.error || "Couldn't open the reference photos.");
        return;
      }
      setPhotos(
        (data || [])
          .filter((item) => item.signedUrl)
          .map((item) => ({ path: item.path, url: item.signedUrl }))
      );
    }
    signPhotos();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (!needle) return true;
      const haystack = [lead.name, lead.email, lead.phone, lead.idea]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [leads, query, statusFilter]);

  function openLead(lead) {
    setSelectedId(lead.id);
    setStatusMessage('');
    setCopied('');
    setConfirmingDelete(false);
  }

  function closePanel() {
    setSelectedId(null);
    setPhotos([]);
    setPhotoError('');
    setStatusMessage('');
    setCopied('');
    setConfirmingDelete(false);
  }

  async function copyValue(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied('');
      setStatusMessage("Couldn't copy that.");
    }
  }

  async function changeStatus(nextStatus) {
    if (!supabase || !selected || nextStatus === selected.status) return;
    if (!LEAD_STATUSES.includes(nextStatus)) return;
    setBusy(true);
    setStatusMessage('saving');
    const { data, error } = await supabase
      .from('leads')
      .update({ status: nextStatus })
      .eq('id', selected.id)
      .select('*')
      .single();
    setBusy(false);
    if (error) {
      setStatusMessage(error.message || "Couldn't update the status.");
      return;
    }
    setLeads((current) => current.map((lead) => (lead.id === data.id ? data : lead)));
    setStatusMessage('saved');
  }

  async function removeSelected() {
    if (!supabase || !selected) return;
    setBusy(true);
    setStatusMessage('');
    const result = await deleteLead(supabase, selected);
    setBusy(false);
    if (!result.ok) {
      setStatusMessage(result.error);
      setConfirmingDelete(false);
      return;
    }
    setLeads((current) => current.filter((lead) => lead.id !== selected.id));
    closePanel();
  }

  const statusOptions = selected && !LEAD_STATUSES.includes(selected.status)
    ? [selected.status, ...LEAD_STATUSES]
    : LEAD_STATUSES;

  return (
    <div className="admin-leads">
      <header className="admin-header">
        <div>
          <p className="admin-studio">Leads</p>
          <Link className="admin-back" to="/admin">
            Back to admin
          </Link>
        </div>
      </header>

      <div className="admin-tabs" role="tablist">
        <button
          className={statusFilter === 'all' ? 'admin-tab is-selected' : 'admin-tab'}
          type="button"
          role="tab"
          aria-selected={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        >
          All ({leads.length})
        </button>
        {LEAD_STATUSES.map((status) => (
          <button
            key={status}
            className={statusFilter === status ? 'admin-tab is-selected' : 'admin-tab'}
            type="button"
            role="tab"
            aria-selected={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          >
            {leadStatusLabel(status)} ({leads.filter((lead) => lead.status === status).length})
          </button>
        ))}
      </div>

      <label className="admin-sr" htmlFor="lead-search">
        Search
      </label>
      <input
        id="lead-search"
        className="admin-input"
        type="search"
        placeholder="Name, email, phone, or idea"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {loading ? <p className="admin-lead">Loading</p> : null}
      {loadError ? (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      ) : null}
      {!loading && !loadError && visible.length === 0 ? (
        <p className="admin-lead">No leads in this view.</p>
      ) : null}

      <div className="admin-lead-list">
        {visible.map((lead) => (
          <button className="admin-lead-row" type="button" key={lead.id} onClick={() => openLead(lead)}>
            <span className="admin-lead-name">{lead.name}</span>
            <span className="admin-lead-summary">{summary(lead)}</span>
            <span className="admin-lead-meta">
              <span>{formatWhen(lead.created_at)}</span>
              <span className="admin-chip">{leadStatusLabel(lead.status)}</span>
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="admin-panel-root">
          <button className="admin-panel-backdrop" type="button" aria-label="Close" onClick={closePanel} />
          <section className="admin-panel" role="dialog" aria-label="Lead">
            <div className="admin-panel-body">
              <p className="admin-lead-when">{formatWhen(selected.created_at)}</p>
              {DETAIL_FIELDS.map(([key, label]) => (
                <div className="admin-lead-field" key={key}>
                  <dt>{label}</dt>
                  <dd>
                    {key === 'email' && selected.email ? (
                      <a href={`mailto:${selected.email}`}>{selected.email}</a>
                    ) : null}
                    {key === 'phone' && selected.phone ? (
                      <a href={phoneHref(selected.phone)}>{selected.phone}</a>
                    ) : null}
                    {key !== 'email' && key !== 'phone' ? displayValue(selected, key) : null}
                    {(key === 'email' && !selected.email) || (key === 'phone' && !selected.phone)
                      ? '—'
                      : null}
                    {['email', 'phone'].includes(key) && selected[key] ? (
                      <button
                        className="admin-button admin-button-quiet"
                        type="button"
                        onClick={() => copyValue(String(selected[key]))}
                      >
                        {copied === String(selected[key]) ? 'Copied' : 'Copy'}
                      </button>
                    ) : null}
                  </dd>
                </div>
              ))}

              <h2>Reference photos</h2>
              {photoError ? (
                <p className="admin-error" role="alert">
                  {photoError}
                </p>
              ) : null}
              {!photoError && photos.length === 0 ? <p>No reference photos.</p> : null}
              <div className="admin-lead-photos">
                {photos.map((photo) => (
                  <a key={photo.path} href={photo.url} target="_blank" rel="noreferrer">
                    <img src={photo.url} alt="" loading="lazy" />
                  </a>
                ))}
              </div>

              <label htmlFor="lead-status">Status</label>
              <select
                id="lead-status"
                className="admin-input"
                value={selected.status}
                disabled={busy}
                onChange={(event) => changeStatus(event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-panel-actions">
              {statusMessage === 'saving' ? <p role="status">Saving…</p> : null}
              {statusMessage === 'saved' ? <p role="status">Saved.</p> : null}
              {statusMessage && statusMessage !== 'saving' && statusMessage !== 'saved' ? (
                <p className="admin-error" role="alert">
                  {statusMessage}
                </p>
              ) : null}
              {confirmingDelete ? (
                <>
                  <p>Delete this lead and its photos?</p>
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
                <button
                  className="admin-button admin-button-quiet"
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete
                </button>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default Leads;
