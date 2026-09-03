import React from 'react';

export default function AlertPanel({ alerts }) {
  const hasAlerts = Array.isArray(alerts) && alerts.length > 0;

  return (
    <div className="coastx-card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: hasAlerts ? '#ef4444' : '#10b981' 
        }}></span>
        <h4 style={{ 
          fontSize: '0.85rem', 
          letterSpacing: '0.06em', 
          color: hasAlerts ? '#b91c1c' : '#047857', 
          textTransform: 'uppercase', 
          fontWeight: 800 
        }}>
          ACTIVE RISK ALERTS
        </h4>
      </div>

      {!hasAlerts ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', padding: '12px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontWeight: 500 }}>
          ✓ No active risk alerts reported by backend engine.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alertText, idx) => (
            <div key={idx} style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: '#b91c1c', fontWeight: 600 }}>
              ⚠️ {alertText}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
