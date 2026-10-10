import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CONTENT_KEYS, saveContent } from './saveContent';
import './content.css';

const LABELS = {
  pricing: 'Pricing',
  policies: 'Policies',
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pricingDraft(value) {
  const tiers = Array.isArray(value?.tiers) ? value.tiers : [];
  return {
    minimum: value?.minimum ?? '',
    note: typeof value?.note === 'string' ? value.note : '',
    tiers: tiers.map((tier) => ({
      label: tier?.label ?? '',
      range: tier?.range ?? '',
    })),
  };
}

function policiesDraft(value) {
  const items = Array.isArray(value) ? value : [];
  return items.map((item) => ({
    title: item?.title ?? '',
    body: item?.body ?? '',
  }));
}

function pricingValue(draft) {
  return {
    minimum: Number(draft.minimum),
    note: draft.note,
    tiers: draft.tiers.map((tier) => ({
      label: tier.label,
      range: tier.range,
    })),
  };
}

function policiesValue(draft) {
  return draft.map((item) => ({
    title: item.title,
    body: item.body,
  }));
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function sameValue(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function moveItem(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function Content() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saved, setSaved] = useState({});
  const [pricing, setPricing] = useState(null);
  const [policies, setPolicies] = useState(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    document.title = 'Pricing & policies | Lyfestyle Tattoos';
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
        .from('site_content')
        .select('key, value')
        .in('key', CONTENT_KEYS);
      if (cancelled) return;
      if (error) {
        setLoadError(error.message || "Couldn't load site text.");
        setLoading(false);
        return;
      }
      const next = {};
      for (const row of data || []) {
        if (CONTENT_KEYS.includes(row.key)) next[row.key] = row.value;
      }
      setSaved(next);
      if (next.pricing) setPricing(pricingDraft(next.pricing));
      if (next.policies) setPolicies(policiesDraft(next.policies));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pricingDirty = Boolean(
    pricing && saved.pricing && !sameValue(pricingValue(pricing), saved.pricing)
  );
  const policiesDirty = Boolean(
    policies && saved.policies && !sameValue(policiesValue(policies), saved.policies)
  );
  const dirty = pricingDirty || policiesDirty;

  useEffect(() => {
    function onBeforeUnload(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function confirmLeave(event) {
    if (!dirty) return;
    if (!window.confirm('You have unsaved changes. Leave this page?')) {
      event.preventDefault();
    }
  }

  function updateTier(index, field, value) {
    setPricing((current) => ({
      ...current,
      tiers: current.tiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [field]: value } : tier
      ),
    }));
    setStatus((current) => ({ ...current, pricing: '' }));
  }

  function updatePolicy(index, field, value) {
    setPolicies((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
    setStatus((current) => ({ ...current, policies: '' }));
  }

  async function savePricing() {
    const value = pricingValue(pricing);
    if (!Number.isFinite(value.minimum)) {
      setStatus((current) => ({
        ...current,
        pricing: 'Enter a minimum price before saving.',
      }));
      return;
    }
    setStatus((current) => ({ ...current, pricing: 'saving' }));
    const result = await saveContent(supabase, 'pricing', value);
    if (!result.ok) {
      setStatus((current) => ({ ...current, pricing: result.error }));
      return;
    }
    setSaved((current) => ({ ...current, pricing: value }));
    setStatus((current) => ({ ...current, pricing: 'saved' }));
  }

  async function savePolicies() {
    const value = policiesValue(policies);
    setStatus((current) => ({ ...current, policies: 'saving' }));
    const result = await saveContent(supabase, 'policies', value);
    if (!result.ok) {
      setStatus((current) => ({ ...current, policies: result.error }));
      return;
    }
    setSaved((current) => ({ ...current, policies: value }));
    setStatus((current) => ({ ...current, policies: 'saved' }));
  }

  return (
    <div className="admin-content">
      <header className="admin-header">
        <div>
          <p className="admin-studio">Pricing & policies</p>
          <Link className="admin-back" to="/admin" onClick={confirmLeave}>
            Back to admin
          </Link>
        </div>
      </header>

      {loading ? <p className="admin-lead">Loading</p> : null}
      {loadError ? (
        <p className="admin-error" role="alert">
          {loadError}
        </p>
      ) : null}

      {pricing ? (
        <section className="admin-content-section" aria-labelledby="pricing-heading">
          <h2 id="pricing-heading">{LABELS.pricing}</h2>
          <label htmlFor="pricing-minimum">Minimum</label>
          <input
            id="pricing-minimum"
            className="admin-input"
            inputMode="decimal"
            value={pricing.minimum}
            onChange={(event) => {
              setPricing((current) => ({ ...current, minimum: event.target.value }));
              setStatus((current) => ({ ...current, pricing: '' }));
            }}
          />
          <label htmlFor="pricing-note">Note</label>
          <textarea
            id="pricing-note"
            className="admin-input admin-textarea"
            rows={3}
            value={pricing.note}
            onChange={(event) => {
              setPricing((current) => ({ ...current, note: event.target.value }));
              setStatus((current) => ({ ...current, pricing: '' }));
            }}
          />
          <div className="admin-content-rows">
            {pricing.tiers.map((tier, index) => (
              <div className="admin-content-row" key={`tier-${index}`}>
                <label htmlFor={`tier-label-${index}`}>Label</label>
                <input
                  id={`tier-label-${index}`}
                  className="admin-input"
                  value={tier.label}
                  onChange={(event) => updateTier(index, 'label', event.target.value)}
                />
                <label htmlFor={`tier-range-${index}`}>Range</label>
                <input
                  id={`tier-range-${index}`}
                  className="admin-input"
                  value={tier.range}
                  onChange={(event) => updateTier(index, 'range', event.target.value)}
                />
                <div className="admin-content-row-actions">
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPricing((current) => ({
                        ...current,
                        tiers: moveItem(current.tiers, index, -1),
                      }));
                      setStatus((current) => ({ ...current, pricing: '' }));
                    }}
                    disabled={index === 0}
                  >
                    Move up
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPricing((current) => ({
                        ...current,
                        tiers: moveItem(current.tiers, index, 1),
                      }));
                      setStatus((current) => ({ ...current, pricing: '' }));
                    }}
                    disabled={index === pricing.tiers.length - 1}
                  >
                    Move down
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPricing((current) => ({
                        ...current,
                        tiers: current.tiers.filter((_, tierIndex) => tierIndex !== index),
                      }));
                      setStatus((current) => ({ ...current, pricing: '' }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-button admin-button-quiet"
            type="button"
            onClick={() => {
              setPricing((current) => ({
                ...current,
                tiers: [...current.tiers, { label: '', range: '' }],
              }));
              setStatus((current) => ({ ...current, pricing: '' }));
            }}
          >
            Add tier
          </button>
          <SectionActions
            dirty={pricingDirty}
            status={status.pricing}
            onSave={savePricing}
            onRevert={() => {
              setPricing(pricingDraft(saved.pricing));
              setStatus((current) => ({ ...current, pricing: '' }));
            }}
          />
        </section>
      ) : null}

      {policies ? (
        <section className="admin-content-section" aria-labelledby="policies-heading">
          <h2 id="policies-heading">{LABELS.policies}</h2>
          <div className="admin-content-rows">
            {policies.map((item, index) => (
              <div className="admin-content-row" key={`policy-${index}`}>
                <label htmlFor={`policy-title-${index}`}>Title</label>
                <input
                  id={`policy-title-${index}`}
                  className="admin-input"
                  value={item.title}
                  onChange={(event) => updatePolicy(index, 'title', event.target.value)}
                />
                <label htmlFor={`policy-body-${index}`}>Policy</label>
                <textarea
                  id={`policy-body-${index}`}
                  className="admin-input admin-textarea"
                  rows={4}
                  value={item.body}
                  onChange={(event) => updatePolicy(index, 'body', event.target.value)}
                />
                <div className="admin-content-row-actions">
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPolicies((current) => moveItem(current, index, -1));
                      setStatus((current) => ({ ...current, policies: '' }));
                    }}
                    disabled={index === 0}
                  >
                    Move up
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPolicies((current) => moveItem(current, index, 1));
                      setStatus((current) => ({ ...current, policies: '' }));
                    }}
                    disabled={index === policies.length - 1}
                  >
                    Move down
                  </button>
                  <button
                    className="admin-button admin-button-quiet"
                    type="button"
                    onClick={() => {
                      setPolicies((current) => current.filter((_, itemIndex) => itemIndex !== index));
                      setStatus((current) => ({ ...current, policies: '' }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-button admin-button-quiet"
            type="button"
            onClick={() => {
              setPolicies((current) => [...current, { title: '', body: '' }]);
              setStatus((current) => ({ ...current, policies: '' }));
            }}
          >
            Add policy
          </button>
          <SectionActions
            dirty={policiesDirty}
            status={status.policies}
            onSave={savePolicies}
            onRevert={() => {
              setPolicies(policiesDraft(saved.policies));
              setStatus((current) => ({ ...current, policies: '' }));
            }}
          />
        </section>
      ) : null}
    </div>
  );
}

function SectionActions({ dirty, status, onSave, onRevert }) {
  const saving = status === 'saving';
  const message =
    status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved.' : status || '';
  const isError = Boolean(status) && status !== 'saving' && status !== 'saved';

  return (
    <div className="admin-content-actions">
      {message ? (
        <p className={isError ? 'admin-error' : 'admin-content-status'} role={isError ? 'alert' : 'status'}>
          {message}
        </p>
      ) : null}
      <button className="admin-button" type="button" onClick={onSave} disabled={!dirty || saving}>
        {saving ? 'Saving' : 'Save'}
      </button>
      <button
        className="admin-button admin-button-quiet"
        type="button"
        onClick={onRevert}
        disabled={!dirty || saving}
      >
        Revert
      </button>
    </div>
  );
}

export default Content;
