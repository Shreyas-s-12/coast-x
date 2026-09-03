import React from 'react';

export default function AboutView({ stats, modelMode }) {
  const isLive = modelMode === 'live';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Overview Card */}
      <div className="coastx-card" style={{ padding: '36px', backgroundColor: '#ffffff' }}>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-ocean)', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.08em' }}>
          PLATFORM ARCHITECTURE
        </div>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-navy)', marginBottom: '16px', fontWeight: 900 }}>
          WHAT IS COASTX?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '920px', marginBottom: '32px', fontWeight: 500 }}>
          CoastX is an AI-powered coastal monitoring platform that analyzes coastal imagery and drone footage using computer vision. It converts visual observations into structured coastal intelligence, tracking object trajectories, identifying swimmer-vessel proximity risks, and providing transparent risk analytics.
        </p>

        {/* Tech Stack Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>DETECTION MODEL</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-ocean)', marginTop: '4px' }}>Ultralytics YOLO</div>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>TRACKING ENGINE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-teal)', marginTop: '4px' }}>ByteTrack OpenCV</div>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>BACKEND REST API</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>FastAPI + Uvicorn</div>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>FRONTEND DASHBOARD</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-sand)', marginTop: '4px' }}>React + Vite</div>
          </div>
        </div>
      </div>

      {/* Core Capabilities Breakdown */}
      <div className="coastx-card" style={{ padding: '36px', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-navy)', marginBottom: '24px', fontWeight: 900 }}>
          SYSTEM CAPABILITIES & SPECIFICATIONS
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          
          <div style={{ background: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', borderLeft: '5px solid #ef4444' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-navy)', marginBottom: '8px', fontWeight: 800 }}>
              01. OBJECT DETECTION
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
              Identifies people, vessels, and plastic objects using standardized bounding box colors (RED for Person, BLUE for Plastic, ORANGE for Boat).
            </p>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', borderLeft: '5px solid #0284c7' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-navy)', marginBottom: '8px', fontWeight: 800 }}>
              02. BYTETRACK TRACKING
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
              Persistent trajectory estimation across video frames using centroid analysis and velocity calculation.
            </p>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', borderLeft: '5px solid #0d9488' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-navy)', marginBottom: '8px', fontWeight: 800 }}>
              03. RISK EVALUATION
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
              Transparent risk score calculation driven by object density, speed anomalies, and vessel-swimmer proximity.
            </p>
          </div>

          <div style={{ background: 'var(--bg-cream)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', borderLeft: '5px solid #d97706' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-navy)', marginBottom: '8px', fontWeight: 800 }}>
              04. EVENT ANALYSIS
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
              Automatic logging of activity events, velocity anomalies, and proximity conflicts to CSV storage.
            </p>
          </div>

        </div>
      </div>

      {/* Model Readiness Status */}
      <div className="coastx-card" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-navy)', marginBottom: '20px', fontWeight: 900 }}>
          MODEL & BACKEND STATUS
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-navy)', fontWeight: 600 }}>Target Model Weights Path</span>
            <code style={{ fontSize: '0.85rem', color: 'var(--accent-ocean)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>C:\CoastX\models\coastx_best.pt</code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-navy)', fontWeight: 600 }}>Operating Mode</span>
            {isLive ? (
              <span className="badge badge-low" style={{ fontSize: '0.82rem' }}>
                ● LIVE MODEL OPERATIONAL
              </span>
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                ● DEMO MODE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-navy)', fontWeight: 600 }}>Supported Target Classes</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(stats?.classes || ["boat", "buoy", "sinker", "swimmer", "trash"]).map(cls => (
                <span key={cls} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '50px', fontSize: '0.78rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 800, border: '1px solid #bae6fd' }}>
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
