/**
 * AASTU Events Hub — Logo Component
 * Displays the official logo image from /public/logo.png
 * Falls back to the SVG icon if the image fails to load.
 */
export default function Logo({ size = 32, showText = false, textSize = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size,
        borderRadius: Math.round(size * 0.22),
        overflow: 'hidden', flexShrink: 0,
        background: '#0A1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src="/logo.png"
          alt="AASTU Events Hub"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => {
            // SVG fallback if logo.png is missing
            e.currentTarget.style.display = 'none';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', String(Math.round(size * 0.75)));
            svg.setAttribute('height', String(Math.round(size * 0.75)));
            svg.setAttribute('viewBox', '0 0 48 48');
            svg.setAttribute('fill', 'none');
            svg.innerHTML = `
              <path d="M8 38L18 10L24 26L30 10L40 38" stroke="#3B6FFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 30H36" stroke="#3B6FFF" stroke-width="2.5" stroke-linecap="round"/>
              <rect x="28" y="18" width="14" height="12" rx="2" stroke="#F5A623" stroke-width="2"/>
              <line x1="28" y1="22" x2="42" y2="22" stroke="#F5A623" stroke-width="1.5"/>
              <line x1="32" y1="18" x2="32" y2="16" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="38" y1="18" x2="38" y2="16" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
            `;
            e.currentTarget.parentElement.appendChild(svg);
          }}
        />
      </div>

      {showText && (
        <div>
          <div style={{ fontSize: textSize, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: 0.5 }}>
            AASTU
          </div>
          <div style={{ fontSize: textSize * 0.75, fontWeight: 700, color: '#3B6FFF', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Events Hub
          </div>
        </div>
      )}
    </div>
  );
}
