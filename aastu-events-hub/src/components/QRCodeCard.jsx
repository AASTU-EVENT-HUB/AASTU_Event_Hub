import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeCard({ value, eventName, eventDate, eventLocation, onDownload }) {
  const handleDownload = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 300, 300);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 25, 25, 250, 250);
      const link = document.createElement('a');
      link.download = `ticket-${value}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    if (onDownload) onDownload();
  };

  return (
    <div style={{
      background: '#0D1224',
      border: '1px solid #1E2A45',
      borderRadius: 16,
      padding: 28,
      textAlign: 'center',
      maxWidth: 320,
      margin: '0 auto',
    }}>
      {/* QR Code */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        display: 'inline-block',
        marginBottom: 16,
      }}>
        <QRCodeSVG
          id="qr-svg"
          value={value || 'AASTU-TICKET'}
          size={180}
          bgColor="#ffffff"
          fgColor="#0A0F2C"
          level="H"
        />
      </div>

      {/* Ticket info */}
      {eventName && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{eventName}</div>
          {eventDate && <div style={{ fontSize: 12, color: '#94A3B8' }}>{eventDate}</div>}
          {eventLocation && (
            <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}>
              <span>📍</span>{eventLocation}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
        Show this at the event entrance
      </div>

      {/* Ticket ID */}
      <div style={{
        background: 'rgba(59,111,255,0.1)',
        border: '1px solid rgba(59,111,255,0.2)',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 11,
        color: '#3B6FFF',
        fontFamily: 'monospace',
        letterSpacing: 1,
        marginBottom: 16,
      }}>
        {value}
      </div>

      <button className="btn btn-outline-white btn-full btn-sm" onClick={handleDownload}>
        ⬇ Download QR
      </button>
    </div>
  );
}
