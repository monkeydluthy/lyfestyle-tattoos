import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ALT_HINT,
  MAX_ALT_LENGTH,
  MAX_FILE_BYTES,
  SIZE_OPTIONS,
  STYLE_OPTIONS,
  UNREADABLE_MESSAGE,
} from './options';
import { processPhoto } from './processPhoto';
import { uploadPiece } from './uploadPiece';
import './upload.css';

const EMPTY_FIELDS = {
  altText: '',
  style: '',
  series: '',
  character: '',
  placement: '',
  size: '',
  title: '',
  caption: '',
  featured: false,
};

const FILL_FIELDS = ['style', 'series', 'placement', 'size'];

function emptyPiece(localId, name) {
  return {
    localId,
    name,
    status: 'waiting',
    retryable: false,
    message: '',
    processing: true,
    previewUrl: '',
    fullBlob: null,
    thumbBlob: null,
    edited: {},
    ...EMPTY_FIELDS,
  };
}

function failedPiece(localId, name, message) {
  return {
    ...emptyPiece(localId, name),
    status: 'failed',
    processing: false,
    message,
  };
}

function statusLabel(piece) {
  if (piece.processing) return 'Waiting';
  if (piece.status === 'uploading') return 'Uploading';
  if (piece.status === 'saved') return 'Saved as draft';
  if (piece.status === 'failed') return 'Failed';
  return 'Waiting';
}

function Upload() {
  const [pieces, setPieces] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [fill, setFill] = useState({
    style: '',
    series: '',
    placement: '',
    size: '',
  });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const previewUrls = useRef([]);

  useEffect(() => {
    document.title = 'Add pieces | Lyfestyle Tattoos';
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase
      .from('works')
      .select('series')
      .then(({ data }) => {
        if (!active || !data) return;
        const values = [
          ...new Set(data.map((row) => row.series).filter(Boolean)),
        ].sort((a, b) => a.localeCompare(b));
        setSeriesOptions(values);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const eligible = pieces.filter(
    (piece) => piece.status !== 'failed' && piece.status !== 'saved'
  );
  const readyCount = eligible.filter(
    (piece) => !piece.processing && piece.altText.trim() && piece.style
  ).length;
  const missingRequired = eligible.some(
    (piece) => piece.processing || !piece.altText.trim() || !piece.style
  );
  const saveDisabled = saving || readyCount === 0 || missingRequired;

  const seriesListId = 'admin-series-options';
  const knownSeries = useMemo(() => {
    const extras = pieces.map((piece) => piece.series.trim()).filter(Boolean);
    return [...new Set([...seriesOptions, ...extras, fill.series.trim()].filter(Boolean))];
  }, [seriesOptions, pieces, fill.series]);

  function updatePiece(localId, patch, editedField) {
    setPieces((current) =>
      current.map((piece) => {
        if (piece.localId !== localId || piece.status === 'saved') return piece;
        const edited = editedField
          ? { ...piece.edited, [editedField]: true }
          : piece.edited;
        return { ...piece, ...patch, edited };
      })
    );
  }

  function applyFill() {
    setPieces((current) =>
      current.map((piece) => {
        if (piece.status === 'saved') return piece;
        if (piece.status === 'failed' && !piece.fullBlob) return piece;
        const next = { ...piece };
        FILL_FIELDS.forEach((field) => {
          if (piece.edited[field]) return;
          if (!fill[field]) return;
          next[field] = fill[field];
        });
        return next;
      })
    );
  }

  async function addFiles(fileList) {
    const incoming = [...fileList];
    if (incoming.length === 0) return;
    const starters = incoming.map((file) => {
      const localId = crypto.randomUUID();
      if (file.type && !file.type.startsWith('image/')) {
        return failedPiece(localId, file.name, 'Only image files can be added.');
      }
      if (file.size > MAX_FILE_BYTES) {
        return failedPiece(localId, file.name, 'This photo is over 30 MB.');
      }
      return emptyPiece(localId, file.name);
    });
    setPieces((current) => [...current, ...starters]);

    await Promise.all(
      starters.map(async (piece, index) => {
        if (piece.status === 'failed') return;
        try {
          const processed = await processPhoto(incoming[index]);
          const previewUrl = URL.createObjectURL(processed.fullBlob);
          previewUrls.current.push(previewUrl);
          setPieces((current) =>
            current.map((item) =>
              item.localId === piece.localId
                ? {
                    ...item,
                    processing: false,
                    status: 'waiting',
                    previewUrl,
                    fullBlob: processed.fullBlob,
                    thumbBlob: processed.thumbBlob,
                  }
                : item
            )
          );
        } catch {
          setPieces((current) =>
            current.map((item) =>
              item.localId === piece.localId
                ? {
                    ...item,
                    processing: false,
                    status: 'failed',
                    retryable: false,
                    message: UNREADABLE_MESSAGE,
                  }
                : item
            )
          );
        }
      })
    );
  }

  async function savePiece(piece) {
    if (!piece || !supabase || piece.processing || piece.status === 'saved') return false;
    if (!piece.altText.trim() || !piece.style || !piece.fullBlob || !piece.thumbBlob) {
      return false;
    }

    setPieces((current) =>
      current.map((item) =>
        item.localId === piece.localId
          ? { ...item, status: 'uploading', message: '' }
          : item
      )
    );

    const result = await uploadPiece(supabase, piece);
    setPieces((current) =>
      current.map((item) => {
        if (item.localId !== piece.localId) return item;
        if (!result.ok) {
          return {
            ...item,
            status: 'failed',
            retryable: true,
            message: "Couldn't save this piece.",
          };
        }
        return {
          ...item,
          status: 'saved',
          retryable: false,
          message: '',
          fullBlob: null,
          thumbBlob: null,
        };
      })
    );
    return result.ok;
  }

  async function saveAll() {
    if (saveDisabled) return;
    const queue = pieces.filter(
      (piece) =>
        piece.status === 'waiting' &&
        !piece.processing &&
        piece.altText.trim() &&
        piece.style &&
        piece.fullBlob
    );
    setSaving(true);
    for (const piece of queue) {
      await savePiece(piece);
    }
    setSaving(false);
  }

  async function retryPiece(localId) {
    const piece = pieces.find((item) => item.localId === localId);
    if (!piece) return;
    setSaving(true);
    await savePiece(piece);
    setSaving(false);
  }

  return (
    <div className="admin-upload">
      <header className="admin-header">
        <div>
          <p className="admin-studio">Add pieces</p>
          <Link className="admin-back" to="/admin">
            Back to admin
          </Link>
        </div>
      </header>

      <div className="admin-fill">
        <p className="admin-fill-title">Fill all with these values</p>
        <label htmlFor="fill-style">Style</label>
        <select
          id="fill-style"
          className="admin-input"
          value={fill.style}
          onChange={(event) => setFill({ ...fill, style: event.target.value })}
        >
          <option value="">Style</option>
          {STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor="fill-series">Series</label>
        <input
          id="fill-series"
          className="admin-input"
          list={seriesListId}
          value={fill.series}
          onChange={(event) => setFill({ ...fill, series: event.target.value })}
        />
        <label htmlFor="fill-placement">Placement</label>
        <input
          id="fill-placement"
          className="admin-input"
          value={fill.placement}
          onChange={(event) =>
            setFill({ ...fill, placement: event.target.value })
          }
        />
        <label htmlFor="fill-size">Size</label>
        <select
          id="fill-size"
          className="admin-input"
          value={fill.size}
          onChange={(event) => setFill({ ...fill, size: event.target.value })}
        >
          <option value="">Size</option>
          {SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="admin-button" type="button" onClick={applyFill}>
          Fill all with these values
        </button>
      </div>

      <label
        className={dragging ? 'admin-drop is-dragging' : 'admin-drop'}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          className="admin-file"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        Choose photos or drop them here
      </label>

      <datalist id={seriesListId}>
        {knownSeries.map((series) => (
          <option key={series} value={series} />
        ))}
      </datalist>

      <div className="admin-piece-list">
        {pieces.map((piece) => {
          const locked = piece.status === 'saved' || piece.processing;
          const showForm = piece.status !== 'failed' || piece.retryable;
          return (
            <article className="admin-piece" key={piece.localId}>
              <div className="admin-piece-top">
                {piece.previewUrl ? (
                  <img src={piece.previewUrl} alt={piece.altText || piece.name} />
                ) : (
                  <div className="admin-piece-placeholder">{piece.name}</div>
                )}
                <p className={`admin-status is-${piece.status}`}>
                  {statusLabel(piece)}
                </p>
              </div>
              {piece.message ? (
                <p className="admin-error" role="alert">
                  {piece.message}
                </p>
              ) : null}
              {piece.retryable ? (
                <button
                  className="admin-button"
                  type="button"
                  disabled={saving}
                  onClick={() => retryPiece(piece.localId)}
                >
                  Retry
                </button>
              ) : null}
              {showForm ? (
                <div className="admin-fields">
                  <label htmlFor={`${piece.localId}-alt`}>Alt text</label>
                  <input
                    id={`${piece.localId}-alt`}
                    className="admin-input"
                    maxLength={MAX_ALT_LENGTH}
                    value={piece.altText}
                    disabled={locked}
                    aria-describedby={`${piece.localId}-alt-hint`}
                    onChange={(event) =>
                      updatePiece(piece.localId, { altText: event.target.value })
                    }
                  />
                  <p className="admin-hint" id={`${piece.localId}-alt-hint`}>
                    {ALT_HINT}
                  </p>
                  <label htmlFor={`${piece.localId}-style`}>Style</label>
                  <select
                    id={`${piece.localId}-style`}
                    className="admin-input"
                    value={piece.style}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(
                        piece.localId,
                        { style: event.target.value },
                        'style'
                      )
                    }
                  >
                    <option value="">Select a style</option>
                    {STYLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`${piece.localId}-series`}>Series</label>
                  <input
                    id={`${piece.localId}-series`}
                    className="admin-input"
                    list={seriesListId}
                    value={piece.series}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(
                        piece.localId,
                        { series: event.target.value },
                        'series'
                      )
                    }
                  />
                  <label htmlFor={`${piece.localId}-character`}>Character</label>
                  <input
                    id={`${piece.localId}-character`}
                    className="admin-input"
                    value={piece.character}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(piece.localId, { character: event.target.value })
                    }
                  />
                  <label htmlFor={`${piece.localId}-placement`}>Placement</label>
                  <input
                    id={`${piece.localId}-placement`}
                    className="admin-input"
                    value={piece.placement}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(
                        piece.localId,
                        { placement: event.target.value },
                        'placement'
                      )
                    }
                  />
                  <label htmlFor={`${piece.localId}-size`}>Size</label>
                  <select
                    id={`${piece.localId}-size`}
                    className="admin-input"
                    value={piece.size}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(
                        piece.localId,
                        { size: event.target.value },
                        'size'
                      )
                    }
                  >
                    <option value="">Size</option>
                    {SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`${piece.localId}-title`}>Title</label>
                  <input
                    id={`${piece.localId}-title`}
                    className="admin-input"
                    value={piece.title}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(piece.localId, { title: event.target.value })
                    }
                  />
                  <label htmlFor={`${piece.localId}-caption`}>Caption</label>
                  <textarea
                    id={`${piece.localId}-caption`}
                    className="admin-input admin-textarea"
                    value={piece.caption}
                    disabled={locked}
                    onChange={(event) =>
                      updatePiece(piece.localId, { caption: event.target.value })
                    }
                  />
                  <label className="admin-check" htmlFor={`${piece.localId}-featured`}>
                    <input
                      id={`${piece.localId}-featured`}
                      type="checkbox"
                      checked={piece.featured}
                      disabled={locked}
                      onChange={(event) =>
                        updatePiece(piece.localId, { featured: event.target.checked })
                      }
                    />
                    Feature on homepage
                  </label>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="admin-savebar">
        <p>
          {readyCount} {readyCount === 1 ? 'piece' : 'pieces'} ready
        </p>
        <button
          className="admin-button"
          type="button"
          disabled={saveDisabled}
          onClick={saveAll}
        >
          {saving ? 'Saving' : 'Save all'}
        </button>
      </div>
    </div>
  );
}

export default Upload;
