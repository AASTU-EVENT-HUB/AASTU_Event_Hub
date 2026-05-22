// AASTU Events Hub Logo Component
export default function Logo({ size = 32, showText = false, textSize = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Logo mark — AE + calendar icon */}
      <div style={{
        width: size, height: size,
        borderRadius: Math.round(size * 0.25),
        background: 'linear-gradient(135deg, #1a2a6c 0%, #0A0F2C 100%)',
        border: '1.5px solid rgba(59,111,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden', position: 'relative',
      }}>
        <svg
          width={size * 0.75}
          height={size * 0.75}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* A shape */}
          <path d="M8 38L18 10L24 26L30 10L40 38" stroke="#3B6FFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M12 30H36" stroke="#3B6FFF" strokeWidth="2.5" strokeLinecap="round"/>
          {/* E / calendar accent */}
          <rect x="28" y="18" width="14" height="12" rx="2" fill="none" stroke="#F5A623" strokeWidth="2"/>
          <line x1="28" y1="22" x2="42" y2="22" stroke="#F5A623" strokeWidth="1.5"/>
          <line x1="32" y1="18" x2="32" y2="16" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="38" y1="18" x2="38" y2="16" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Star sparkle */}
          <path d="M38 10 L39 8 L40 10 L42 11 L40 12 L39 14 L38 12 L36 11 Z" fill="#F5A623"/>
        </svg>
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
