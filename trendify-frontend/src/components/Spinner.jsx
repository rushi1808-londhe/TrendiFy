export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  return (
    <div className="tf-spinner-overlay">
      <div className="spinner-border" role="status"
        style={{ width: s, height: s, color: 'var(--gold)', borderWidth: 2 }}>
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <span className="spinner-border spinner-border-sm me-2"
      style={{ color: 'inherit', borderWidth: 2 }} role="status" />
  );
}
