import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchPublishedWorks } from '../lib/works';
import { processPhoto } from '../admin/processPhoto';
import { STYLE_OPTIONS, SIZE_OPTIONS } from '../admin/options';
import './intake.css';

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const PHOTO_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;
const MIN_FILL_MS = 3000;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_KEY = 'lyfestyle-lead-sent-at';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY = {
  name: '',
  email: '',
  idea: '',
  placement: '',
  size: '',
  phone: '',
  style: '',
  budget: '',
  timing: '',
  instagram: '',
};

function newLeadId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readCooldown() {
  try {
    const sentAt = Number(window.localStorage.getItem(COOLDOWN_KEY));
    return Number.isFinite(sentAt) ? sentAt : 0;
  } catch {
    return 0;
  }
}

function writeCooldown() {
  try {
    window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Private mode or blocked storage: the cooldown is only a convenience.
  }
}

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email, like name@example.com.';
  }
  if (!values.idea.trim()) errors.idea = 'Tell Clyde what you have in mind.';
  if (!values.placement.trim()) errors.placement = 'Say where on your body it would go.';
  if (!values.size) errors.size = 'Pick a rough size.';
  return errors;
}

function photoProblem(file) {
  const typeOk = PHOTO_TYPES.includes(file.type) || (!file.type && PHOTO_EXTENSIONS.test(file.name));
  if (!typeOk) return `${file.name} isn't a JPG, PNG, WebP or HEIC photo.`;
  if (file.size > MAX_PHOTO_BYTES) return `${file.name} is over 10 MB.`;
  return '';
}

function firstNameOf(name) {
  return name.trim().split(/\s+/)[0] || '';
}

function IntakeForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const refId = params.get('ref') || '';
  const [values, setValues] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [photoNote, setPhotoNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const mountedAt = useRef(Date.now());
  const submittingRef = useRef(false);
  const ideaTouched = useRef(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const busy = photos.some((photo) => photo.status === 'processing');

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => photo.preview && URL.revokeObjectURL(photo.preview));
    },
    []
  );

  useEffect(() => {
    if (!refId) return undefined;
    let active = true;
    const scroll = () => document.getElementById('start')?.scrollIntoView({ block: 'start' });
    scroll();
    if (UUID_PATTERN.test(refId)) {
      fetchPublishedWorks().then((result) => {
        if (!active) return;
        const work = result.works.find((item) => item.id === refId);
        if (work?.title && !ideaTouched.current) {
          setValues((current) =>
            current.idea
              ? current
              : { ...current, idea: `I'd like something like: ${work.title}` }
          );
        }
        window.setTimeout(() => active && scroll(), 150);
      });
    }
    return () => {
      active = false;
    };
  }, [refId]);

  function setField(field) {
    return (event) => {
      const { value } = event.target;
      if (field === 'idea') ideaTouched.current = true;
      setValues((current) => ({ ...current, [field]: value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
    };
  }

  async function addPhotos(event) {
    const picked = [...event.target.files];
    event.target.value = '';
    if (picked.length === 0) return;
    setPhotoNote('');
    const room = MAX_PHOTOS - photosRef.current.length;
    const problems = [];
    if (picked.length > room) problems.push(`You can add up to ${MAX_PHOTOS} photos.`);
    const accepted = [];
    for (const file of picked.slice(0, Math.max(room, 0))) {
      const problem = photoProblem(file);
      if (problem) problems.push(problem);
      else accepted.push(file);
    }
    setPhotoNote(problems.join(' '));
    const entries = accepted.map((file) => ({
      key: newLeadId(),
      name: file.name,
      status: 'processing',
      blob: null,
      preview: '',
      error: '',
      file,
    }));
    if (entries.length === 0) return;
    setPhotos((current) => [...current, ...entries]);
    for (const entry of entries) {
      let patch;
      try {
        const { fullBlob } = await processPhoto(entry.file);
        patch = { status: 'ready', blob: fullBlob, preview: URL.createObjectURL(fullBlob) };
      } catch (error) {
        patch = { status: 'error', error: error.message };
      }
      setPhotos((current) =>
        current.map((photo) =>
          photo.key === entry.key ? { ...photo, ...patch, file: null } : photo
        )
      );
    }
  }

  function removePhoto(key) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.key === key);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((photo) => photo.key !== key);
    });
    setPhotoNote('');
  }

  function fakeSuccess() {
    writeCooldown();
    navigate('/thanks', { state: { firstName: firstNameOf(values.name) } });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    setFormError('');

    if (honeypot) {
      fakeSuccess();
      return;
    }

    const found = validate(values);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      document.getElementById(`lead-${firstBad}`)?.focus();
      return;
    }
    if (busy) {
      setFormError('Your photos are still getting ready. Try again in a moment.');
      return;
    }
    if (photos.some((photo) => photo.status === 'error')) {
      setFormError('Remove the photos that failed, or replace them, then send again.');
      return;
    }
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      setFormError('That was quick. Give it a second and send again.');
      return;
    }
    if (Date.now() - readCooldown() < COOLDOWN_MS) {
      setFormError('You just sent a request. Give it a minute before sending another.');
      return;
    }
    if (!supabase) {
      setFormError("The form can't reach the server right now.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const id = newLeadId();
      const paths = [];
      const ready = photos.filter((photo) => photo.status === 'ready');
      for (let index = 0; index < ready.length; index += 1) {
        const path = `${id}/ref-${index + 1}.webp`;
        const { error } = await supabase.storage
          .from('lead-references')
          .upload(path, ready[index].blob, { contentType: 'image/webp', upsert: false });
        if (error) throw error;
        paths.push(path);
      }

      const row = {
        id,
        name: values.name.trim(),
        email: values.email.trim(),
        idea: values.idea.trim(),
        placement: values.placement.trim(),
        size: values.size,
        reference_paths: paths,
        source: 'website',
      };
      for (const field of ['phone', 'style', 'budget', 'timing', 'instagram']) {
        const value = values[field].trim();
        if (value) row[field] = value;
      }
      const { error } = await supabase.from('leads').insert(row);
      if (error) throw error;

      writeCooldown();
      navigate('/thanks', { state: { firstName: firstNameOf(values.name) } });
    } catch {
      setFormError('fail');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function field(name, label, input, hint) {
    const error = errors[name];
    const describedBy = [hint && `lead-${name}-hint`, error && `lead-${name}-error`]
      .filter(Boolean)
      .join(' ');
    return (
      <div className="intake-field">
        <label htmlFor={`lead-${name}`}>{label}</label>
        {input({
          id: `lead-${name}`,
          name,
          value: values[name],
          onChange: setField(name),
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': describedBy || undefined,
        })}
        {hint ? (
          <p className="intake-hint" id={`lead-${name}-hint`}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p className="intake-error" id={`lead-${name}-error`}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const text = (type, extra = {}) => (props) => <input type={type} {...extra} {...props} />;

  return (
    <form className="intake-form" onSubmit={handleSubmit} noValidate>
      <p className="intake-lead">
        Tell Clyde about the tattoo you want. Required fields are marked.
      </p>

      {field('name', 'Name (required)', text('text', { autoComplete: 'name' }))}
      {field('email', 'Email (required)', text('email', { autoComplete: 'email', inputMode: 'email' }))}
      {field(
        'idea',
        'Your idea (required)',
        (props) => <textarea rows={5} {...props} />,
        'What it is, any character or series, and how you picture it.'
      )}
      {field(
        'placement',
        'Placement (required)',
        text('text'),
        'Where on your body. Example: left forearm.'
      )}
      {field('size', 'Size (required)', (props) => (
        <select {...props}>
          <option value="">Choose a size</option>
          {SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      <fieldset className="intake-optional">
        <legend>Optional</legend>
        {field('phone', 'Phone', text('tel', { autoComplete: 'tel', inputMode: 'tel' }))}
        {field('style', 'Style', (props) => (
          <select {...props}>
            <option value="">Not sure yet</option>
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
        {field('budget', 'Budget', text('text'), 'A rough number helps Clyde quote.')}
        {field('timing', 'Timing', text('text'), 'Example: next month, or any weekend.')}
        {field('instagram', 'Instagram', text('text', { autoCapitalize: 'none' }), 'Your @handle.')}
      </fieldset>

      <div className="intake-field">
        <label htmlFor="lead-photos">Reference photos (optional)</label>
        <input
          id="lead-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={addPhotos}
          disabled={photos.length >= MAX_PHOTOS || submitting}
          aria-describedby="lead-photos-hint"
        />
        <p className="intake-hint" id="lead-photos-hint">
          Up to {MAX_PHOTOS} photos, 10 MB each. JPG, PNG, WebP or HEIC. Location data is
          removed before upload.
        </p>
        {photoNote ? (
          <p className="intake-error" role="alert">
            {photoNote}
          </p>
        ) : null}
        {photos.length > 0 ? (
          <ul className="intake-photos">
            {photos.map((photo) => (
              <li key={photo.key}>
                {photo.preview ? <img src={photo.preview} alt="" width="56" height="56" /> : <span className="intake-thumb" />}
                <span className="intake-photo-name">
                  {photo.name}
                  {photo.status === 'processing' ? ' (preparing)' : ''}
                </span>
                {photo.error ? <span className="intake-error">{photo.error}</span> : null}
                <button type="button" onClick={() => removePhoto(photo.key)} disabled={submitting}>
                  Remove<span className="sr-only"> {photo.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="intake-hp" aria-hidden="true">
        <label htmlFor="lead-website">Leave this field empty</label>
        <input
          id="lead-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {formError ? (
        <div className="intake-fail" role="alert">
          {formError === 'fail' ? (
            <>
              Something went wrong sending your request. Your answers are still here, so you can
              try again. Or message Clyde on{' '}
              <a href="https://ig.me/m/lyfetattooos">Instagram @lyfetattooos</a>.
            </>
          ) : (
            formError
          )}
        </div>
      ) : null}

      <button className="intake-submit" type="submit" disabled={submitting || busy}>
        {submitting ? 'Sending…' : 'Send my request'}
      </button>
      <p className="intake-hint">
        Prefer Instagram? <a href="https://ig.me/m/lyfetattooos">Message @lyfetattooos</a>.
      </p>
    </form>
  );
}

export default IntakeForm;
