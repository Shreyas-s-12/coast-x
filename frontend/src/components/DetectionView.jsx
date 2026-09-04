import React from 'react';

export default function DetectionView({ data, error }) {
  if (error) {
    return (
      <div className="coastx-card" style={{ padding: '20px 24px', borderColor: '#fca5a5', background: '#fef2f2' }}>
        <div style={{ color: '#b91c1c', fontSize: '0.9rem', fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const rawUrl = data.output_url || data.output_video || data.image_url || data.video_url;
  const outputUrl = rawUrl && rawUrl.startsWith('/') ? `http://localhost:8000${rawUrl}` : rawUrl;
  const isVideo = Boolean(outputUrl && (outputUrl.endsWith('.mp4') || outputUrl.endsWith('.webm') || data.video_url || data.output_video));

  return (
    <div className="coastx-card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-ocean)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
            ANNOTATED DETECTION FEED
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge badge-low">
            PROCESSED FEED
          </span>
          {data.original_filename && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {data.original_filename}
            </span>
          )}
        </div>
      </div>

      {/* Video or Image Display Area — Enlarged visual container with min-height 520px */}
      <div style={{ 
        position: 'relative', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden', 
        border: '1px solid var(--border-subtle)', 
        background: '#0f172a', 
        boxShadow: 'var(--shadow-card)',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isVideo ? (
          <video 
            controls 
            autoPlay 
            loop 
            src={outputUrl} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              minHeight: '520px', 
              maxHeight: '750px', 
              objectFit: 'contain', 
              display: 'block' 
            }} 
          />
        ) : (
          <img 
            src={outputUrl} 
            alt="Annotated Coastal Detection" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              minHeight: '520px', 
              maxHeight: '750px', 
              objectFit: 'contain', 
              display: 'block' 
            }} 
          />
        )}
      </div>

      {/* Detections Detail Badges List — Compact & Scrollable */}
      {data.objects && Array.isArray(data.objects) && data.objects.length > 0 && (
        <div style={{ marginTop: '18px', background: 'var(--bg-cream)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            DETECTED OBJECT PREDICTIONS ({data.objects.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '110px', overflowY: 'auto', paddingRight: '4px' }}>
            {data.objects.map((obj, idx) => {
              const cls = (obj.class || '').toLowerCase();
              const isPerson = ['person', 'swimmer', 'people'].includes(cls);
              const isBoat = ['boat', 'vessel', 'ship'].includes(cls);
              
              const textColor = isPerson ? '#ef4444' : isBoat ? '#f97316' : '#3b82f6';
              const bgColor = isPerson ? 'rgba(239, 68, 68, 0.1)' : isBoat ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)';
              const borderColor = isPerson ? 'rgba(239, 68, 68, 0.3)' : isBoat ? 'rgba(249, 115, 22, 0.3)' : 'rgba(59, 130, 246, 0.3)';
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    padding: '5px 12px', 
                    borderRadius: '50px', 
                    fontSize: '0.8rem', 
                    color: 'var(--text-navy)',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: textColor }}></span>
                  <strong style={{ color: textColor, textTransform: 'uppercase' }}>
                    {obj.class}
                  </strong> 
                  <span style={{ opacity: 0.8, fontWeight: 600 }}>
                    {Math.round(obj.confidence * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
