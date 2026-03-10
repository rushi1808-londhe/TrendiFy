export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(184,146,74,.15)', padding: '2rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 700 }}>
              Trendi<span style={{ color: 'var(--cream)', fontStyle: 'italic' }}>Fy</span>
            </div>
            <p style={{ color: 'rgba(250,247,242,.35)', fontSize: '.78rem', marginTop: '.4rem' }}>
              Fashion Redefined
            </p>
          </div>
          <div className="col-md-4 text-center">
            <p style={{ color: 'rgba(250,247,242,.25)', fontSize: '.75rem', margin: 0 }}>
              © {new Date().getFullYear()} TrendiFy. All rights reserved.
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="d-flex gap-3 justify-content-md-end">
              {['bi-instagram', 'bi-twitter-x', 'bi-pinterest'].map(icon => (
                <a key={icon} href="#" style={{ color: 'rgba(250,247,242,.3)', fontSize: '1.1rem', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(250,247,242,.3)'}>
                  <i className={`bi ${icon}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
