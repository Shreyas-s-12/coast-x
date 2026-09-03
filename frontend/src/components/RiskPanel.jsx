import React from 'react';

export default function RiskPanel({ risk }) {
  if (!risk) {
    return (
      <div className="coastx-card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <h4 style={{ fontSize: '0.85rem', marginBottom: '14px', letterSpacing: '0.08em', color: 'var(--accent-ocean)', textTransform: 'uppercase', fontWeight: 800 }}>
          COASTAL RISK
        </h4>
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '4px' }}>
            Awaiting Analysis
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: 500 }}>
            Upload coastal media to calculate dynamic risk indicators.
          </div>
        </div>
      </div>
    );
  }

  const level = risk.risk_level || risk.level || 'LOW';
  const score = typeof risk.score === 'number' ? risk.score : (risk.risk_score || 0);
  const activity = risk.activity || risk.density_level || 'LOW';

  const badgeClass = level === 'HIGH' ? 'badge-high' : (level === 'MEDIUM' || level === 'MODERATE') ? 'badge-medium' : 'badge-low';
  const scoreColor = level === 'HIGH' ? '#b91c1c' : (level === 'MEDIUM' || level === 'MODERATE') ? '#b45309' : '#047857';

  return (
    <div className="coastx-card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', letterSpacing: '0.08em', color: 'var(--accent-ocean)', textTransform: 'uppercase', fontWeight: 800 }}>
          COASTAL RISK
        </h4>
        <span className={`badge ${badgeClass}`}>
          {level}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-cream)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            Risk Score
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
            {score}%
          </div>
        </div>

        <div style={{ background: 'var(--bg-cream)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            Density
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-navy)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {activity}
          </div>
        </div>
      </div>

      {risk.summary && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: 500 }}>
          {risk.summary}
        </p>
      )}
    </div>
  );
}
