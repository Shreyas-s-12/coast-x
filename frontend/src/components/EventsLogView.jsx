import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../services/api';

export default function EventsLogView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchEvents();
      if (res && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error("Error loading logged events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.event_type === filterType;
  });

  return (
    <div className="coastx-card" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-ocean)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px' }}>
            HISTORICAL AUDIT TRAIL
          </div>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-navy)', fontWeight: 900 }}>
            Logged Coastal Events
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
            Recorded object tracking and anomaly events from backend CSV log pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              background: 'var(--bg-cream)', 
              color: 'var(--text-navy)', 
              border: '1px solid var(--border-subtle)', 
              padding: '10px 16px', 
              borderRadius: '50px', 
              fontSize: '0.88rem', 
              outline: 'none',
              fontWeight: 700 
            }}
          >
            <option value="ALL">All Event Types</option>
          </select>

          <button 
            className="btn-secondary"
            onClick={loadEvents} 
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Logs'}
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.05rem', background: 'var(--bg-cream)', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', fontWeight: 600 }}>
          No events detected.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <table className="coastx-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Frame</th>
                <th>Object ID</th>
                <th>Class</th>
                <th>Confidence</th>
                <th>Event Type</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.slice().reverse().map((ev, idx) => {
                const cls = (ev.class || '').toLowerCase();
                const isPerson = ['person', 'swimmer'].includes(cls);
                const isBoat = ['boat', 'vessel'].includes(cls);
                const classColor = isPerson ? '#ef4444' : isBoat ? '#f97316' : '#3b82f6';

                return (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{ev.timestamp || '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{ev.frame || '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-ocean)' }}>#{ev.object_id}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontWeight: 800, 
                        color: classColor,
                        textTransform: 'uppercase',
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: classColor }}></span>
                        {ev.class}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{ev.confidence ? `${Math.round(parseFloat(ev.confidence) * 100)}%` : '-'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-navy)' }}>
                      {ev.event_type || 'DETECTION'}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-sand)', fontFamily: 'var(--font-mono)' }}>
                      {ev.risk_score}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
