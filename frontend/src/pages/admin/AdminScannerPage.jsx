import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import CheckinOverlay from '../../components/CheckinOverlay';
import { checkinAPI, eventsAPI } from '../../services/api';

const INITIAL_CHECKINS = [];

export default function AdminScannerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [checkins, setCheckins] = useState(INITIAL_CHECKINS);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [scanning, setScanning] = useState(false);
  const manualInputRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerDivId = 'html5qr-scanner';

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, sRes] = await Promise.all([
          eventsAPI.getById(eventId),
          checkinAPI.getStats(eventId),
        ]);
        setEvent(eRes.data.event);
        setCheckedCount(sRes.data.stats?.checkedIn || 0);
        setTotalRegistered(sRes.data.stats?.totalRegistered || 0);
      } catch {
        // Event may not exist yet — that's ok
      }
    };
    load();
  }, [eventId]);

  const processQR = async (qrData) => {
    if (scannerRef.current) {
      try { scannerRef.current.pause(true); } catch (_) {}
    }

    try {
      const res = await checkinAPI.scan(qrData, eventId);
      const studentName = res.data?.studentName || 'Student';
      setOverlay({ type: 'success', name: studentName });
      setCheckedCount(c => c + 1);
      setCheckins(prev => [
        { name: studentName, time: 'Just now', avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}` },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || (status === 409 ? 'Already checked in' : 'Invalid QR');
      setOverlay({ type: 'error', name: msg });
    }
  };

  const handleOverlayDone = () => {
    setOverlay(null);
    if (scannerRef.current) {
      try { scannerRef.current.resume(); } catch (_) {}
    }
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        videoConstraints: { facingMode: { ideal: 'environment' } },
      },
      false
    );

    scanner.render(
      (decodedText) => { if (!overlay) processQR(decodedText); },
      (errorMsg) => { if (!errorMsg.includes('No MultiFormat Readers')) console.warn('QR scan error:', errorMsg); }
    );

    scannerRef.current = scanner;
    return () => { scanner.clear().catch(() => {}); scannerRef.current = null; };
  }, [scanning]);

  const handleManualScan = () => {
    const val = manualInputRef.current?.value?.trim();
    if (!val) return;
    processQR(val);
    if (manualInputRef.current) manualInputRef.current.value = '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column', maxWidth: 420, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: '#0D1224', borderBottom: '1px solid #1E2A45', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(`/admin/checkin/${eventId}`)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}>←</button>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{event?.title || `Event #${eventId}`}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Check-in Scanner</div>
        </div>
      </div>

      {/* Counter */}
      <div style={{ padding: '12px 20px', background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.2)', display: 'flex', justifyContent: 'center', gap: 4, fontSize: 14, fontWeight: 600, color: '#22C55E' }}>
        <span>{checkedCount} Checked In</span>
        <span style={{ color: '#64748B' }}>/</span>
        <span style={{ color: '#94A3B8' }}>{totalRegistered} Registered</span>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        {/* Camera viewfinder */}
        <div style={{ position: 'relative', background: '#0D1224', borderRadius: 16, overflow: 'hidden', border: '1px solid #1E2A45', minHeight: 300 }}>
          {!scanning && [
            { top: 12, left: 12, borderTop: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
            { top: 12, right: 12, borderTop: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
            { bottom: 12, left: 12, borderBottom: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
            { bottom: 12, right: 12, borderBottom: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
          ].map((style, i) => (
            <div key={i} style={{ position: 'absolute', width: 24, height: 24, borderRadius: 2, zIndex: 2, ...style }} />
          ))}

          <div id={scannerDivId} style={{ display: scanning ? 'block' : 'none', borderRadius: 16, overflow: 'hidden' }} />

          {!scanning && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>📷</div>
              <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>Camera is off</div>
            </div>
          )}

          {overlay && <CheckinOverlay type={overlay.type} studentName={overlay.name} onDone={handleOverlayDone} />}
        </div>

        <button
          className={`btn btn-full ${scanning ? 'btn-outline' : 'btn-primary'}`}
          style={{ marginTop: 12, borderRadius: 10 }}
          onClick={() => setScanning(s => !s)}
        >
          {scanning ? '⏹ Stop Camera' : '📷 Start Camera Scanner'}
        </button>

        {/* Manual input */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            ref={manualInputRef}
            type="text"
            placeholder="Enter ticket ID manually..."
            className="form-input"
            style={{ flex: 1, fontSize: 13 }}
            onKeyDown={e => e.key === 'Enter' && handleManualScan()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleManualScan}>Scan</button>
        </div>

        {/* Recent check-ins */}
        {checkins.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Recent Check-ins</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {checkins.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#111827', border: '1px solid #1E2A45', borderRadius: 10, padding: '10px 14px' }}>
                  <img src={c.avatar} alt={c.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{c.time}</div>
                  <span className="badge badge-green" style={{ fontSize: 9 }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        #${scannerDivId} { background: #0D1224 !important; }
        #${scannerDivId} > div { background: #0D1224 !important; border: none !important; }
        #${scannerDivId} video { border-radius: 12px; }
        #${scannerDivId} img { display: none !important; }
        #${scannerDivId} #html5-qrcode-anchor-scan-type-change { display: none !important; }
      `}</style>
    </div>
  );
}
