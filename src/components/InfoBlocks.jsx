const STEPS = [
  'Send your idea and reference photos.',
  'Clyde reviews it and replies with a quote and timing.',
  'A deposit locks in your date.',
  'Get tattooed.',
];

function formatMinimum(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return `$${number.toLocaleString('en-US')}`;
}

export function HowItWorks() {
  return (
    <section className="info-block" id="how-it-works" aria-labelledby="how-heading">
      <h2 id="how-heading">How it works</h2>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

export function Pricing({ pricing }) {
  const tiers = Array.isArray(pricing?.tiers) ? pricing.tiers : [];
  const minimum = formatMinimum(pricing?.minimum);
  if (!minimum && tiers.length === 0) return null;
  return (
    <section className="info-block" id="pricing" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">Pricing</h2>
      {minimum ? (
        <p className="price-minimum">
          Minimum <strong>{minimum}</strong>
        </p>
      ) : null}
      {tiers.length > 0 ? (
        <dl className="price-tiers">
          {tiers.map((tier, index) => (
            <div key={`${tier.label}-${index}`}>
              <dt>{tier.label}</dt>
              <dd>{tier.range}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {pricing?.note ? <p className="info-note">{pricing.note}</p> : null}
    </section>
  );
}

export function Policies({ policies }) {
  const items = Array.isArray(policies) ? policies : [];
  if (items.length === 0) return null;
  return (
    <section className="info-block" id="policies" aria-labelledby="policies-heading">
      <h2 id="policies-heading">Policies</h2>
      <div className="policy-list">
        {items.map((item, index) => (
          <details key={`${item.title}-${index}`}>
            <summary>{item.title}</summary>
            <p>{item.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
