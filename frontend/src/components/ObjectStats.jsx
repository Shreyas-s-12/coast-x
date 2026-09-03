import React from 'react';

export default function ObjectStats({ detections, objectCount }) {
  let counts = objectCount;

  if (!counts && detections && Array.isArray(detections)) {
    counts = detections.reduce((acc, det) => {
      const cls = det.class || det.class_name || 'unknown';
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    }, {});
  }

  const entries = counts ? Object.entries(counts) : [];

  return (
    <div className="coastx-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '0.85rem', letterSpacing: '0.08em', color: 'var(--accent-teal)', textTransform: 'uppercase', fontWeight: 800 }}>
          OBJECT STATISTICS
        </h4>
        {entries.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {Object.values(counts).reduce((a, b) => a + b, 0)} TOTAL
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Awaiting analysis
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Upload an image or video to begin detecting coastal objects.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map(([cls, count]) => (
            <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                {cls}
              </span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
