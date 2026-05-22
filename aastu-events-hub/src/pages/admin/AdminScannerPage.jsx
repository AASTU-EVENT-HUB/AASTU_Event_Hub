import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axios from 'axios';
import CheckinOverlay from '../../components/CheckinOverlay';
import { MOCK_EVENTS, MOCK_CHECKIN_STATS } from '../../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const INITIAL_CHECKINS = [
  { name: 'Henok Tadesse', time: '2 mins ago', avatar: 'https://i.pravatar.cc/40?img=10' },
  { name: 'Tigist Alemu', time: '5 mins ago', avatar: 'https://i.pravatar.cc/40?img=11' },
  { name: 'Sara Haile', time: '8 mins ago', avatar: 'https://i.pravatar.cc/40?img=13' },
];

export default function AdminScannerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = MOCK_EVENTS.find((e) => e.id === eventId) || MOCK_EVENTS[1];

  const [overlay, setOverlay] = useState(null); // { type: 'success'|'error', name: string }
  const [checkins, setCheckins] = useState(INITIAL_CHECKINS);
  const [checkedCount, setCheckedCount] = useState(MOCK_CHECKIN_STATS.checkedIn);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const manualInputRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerDivId = 'html5qr-scanner';

  // ── Process a scanned QR string ──────────────────────────────────────────
  const processQR = async (qrData) => {
    // Pause scanner while overlay is showing
    if (scannerRef.current) {
      try { scannerRef.current.pause(true); } catch (_) { /* ignore */ }
    }

    try {
      let studentName = 'Student';
      try {
        const res = await axios.post(`${API_BASE}/checkin/scan`, {
          qrData,
          eventId,
        });
        studentName = res.data?.studentName || res.data?.name || 'Student';
        setOverlay({ type: 'success', name: studentName });
        setCheckedCount((c) => c + 1);
        setCheckins((prev) => [
          {
            name: studentName,
            time: 'Just now',
            avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`,
          },
          ...prev.slice(0, 4),
        ]);
      } catch (err) {
        const status = err?.response?.status;
        const msg = status === 409 ? 'Already checked in' : 'Invalid QR';
        setOverlay({ type: 'error', name: msg });
      }
    } catch {
      setOverlay({ type: 'error', name: 'Invalid QR' });
    }
  };

  // ── Resume scanner after overlay dismisses ───────────────────────────────
  const handleOverlayDone = () => {
    setOverlay(null);
    if (scannerRef.current) {
      try { scannerRef.current.resume(); } catch (_) { /* ignore */ }
    }
  };

  // ── Start / stop camera scanner ──────────────────────────────────────────
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      scannerDivId,
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        // Prefer back camera on mobile
        videoConstraints: {
          facingMode: { ideal: 'environment' },
        },
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Only process if no overlay is currently showing
        if (!overlay) processQR(decodedText);
      },
      (errorMsg) => {
        // Ignore per-frame "not found" errors — they're normal
        if (!errorMsg.includes('No MultiFormat Readers')) {
          console.warn('QR scan error:', errorMsg);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  // ── Manual / simulate scan ───────────────────────────────────────────────
  const handleManualScan = () => {
    const val = manualInputRef.current?.value?.trim();
    if (!val) return;
    processQR(val);
    if (manualInputRef.current) manualInputRef.current.value = '';
  };

  const simulateScan = (success) => {
    if (success) {
      processQR('QR-AAU-E2-U1-DEMO');
    } else {
      // Simulate a 409 already-checked-in response
      if (scannerRef.current) {
        try { scannerRef.current.pause(true); } catch (_) { /* ignore */ }
      }
      setOverlay({ type: 'error', name: 'Already checked in' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0F2C',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: '#0D1224',
          borderBottom: '1px solid #1E2A45',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate(`/admin/checkin/${eventId}`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ←
        </button>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {event.title}
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Check-in Scanner</div>
        </div>
      </div>

      {/* Counter */}
      <div
        style={{
          padding: '12px 20px',
          background: 'rgba(34,197,94,0.08)',
          borderBottom: '1px solid rgba(34,197,94,0.2)',
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          fontSize: 14,
          fontWeight: 600,
          color: '#22C55E',
        }}
      >
        <span>{checkedCount} Checked In</span>
        <span style={{ color: '#64748B' }}>/</span>
        <span style={{ color: '#94A3B8' }}>
          {MOCK_CHECKIN_STATS.totalRegistered} Registered
        </span>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        {/* Camera viewfinder */}
        <div
          style={{
            position: 'relative',
            background: '#0D1224',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #1E2A45',
            minHeight: 300,
          }}
        >
          {/* Corner brackets (decorative, shown when camera is off) */}
          {!scanning &&
            [
              { top: 12, left: 12, borderTop: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
              { top: 12, right: 12, borderTop: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
              { bottom: 12, left: 12, borderBottom: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
              { bottom: 12, right: 12, borderBottom: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
            ].map((style, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  borderRadius: 2,
                  zIndex: 2,
                  ...style,
                }}
              />
            ))}

          {/* html5-qrcode mounts here */}
          <div
            id={scannerDivId}
            style={{
              display: scanning ? 'block' : 'none',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          />

          {/* Placeholder when camera is off */}
          {!scanning && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                gap: 12,
              }}
            >
              {cameraError ? (
                <>
                  <div style={{ fontSize: 36 }}>📷</div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#EF4444',
                      textAlign: 'center',
                      padding: '0 20px',
                    }}
                  >
                    {cameraError}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, opacity: 0.3 }}>📷</div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748B',
                      textAlign: 'center',
                    }}
                  >
                    Camera is off
                  </div>
                </>
              )}
            </div>
          )}

          {/* Overlay */}
          {overlay && (
            <CheckinOverlay
              type={overlay.type}
              studentName={overlay.name}
              onDone={handleOverlayDone}
            />
          )}
        </div>

        {/* Start / Stop camera button */}
        <button
          className={`btn btn-full ${scanning ? 'btn-outline' : 'btn-primary'}`}
          style={{ marginTop: 12, borderRadius: 10 }}
          onClick={() => {
            setCameraError(null);
            setScanning((s) => !s);
          }}
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
            onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleManualScan}>
            Scan
          </button>
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            className="btn btn-sm"
            style={{
              flex: 1,
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E',
            }}
            onClick={() => simulateScan(true)}
          >
            ✓ Simulate Success
          </button>
          <button
            className="btn btn-sm"
            style={{
              flex: 1,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
            }}
            onClick={() => simulateScan(false)}
          >
            ✕ Simulate Error
          </button>
        </div>

        {/* Recent check-ins */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 12,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            Recent Check-ins
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checkins.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#111827',
                  border: '1px solid #1E2A45',
                  borderRadius: 10,
                  padding: '10px 14px',
                  animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
                }}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {c.name}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{c.time}</div>
                <span className="badge badge-green" style={{ fontSize: 9 }}>
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Override html5-qrcode default white background */
        #${scannerDivId} {
          background: #0D1224 !important;
        }
        #${scannerDivId} > div {
          background: #0D1224 !important;
          border: none !important;
        }
        #${scannerDivId} video {
          border-radius: 12px;
        }
        #${scannerDivId} img {
          display: none !important;
        }
        /* Hide the default "Scan an image file" section */
        #${scannerDivId} #html5-qrcode-anchor-scan-type-change {
          display: none !important;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
