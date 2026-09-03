import React, { useState, useEffect } from 'react';
import logo from '../images/CoastX.png';
import EventsLogView from '../components/EventsLogView';
import AboutView from '../components/AboutView';
import ImageAnalysisPage from './ImageAnalysisPage';
import VideoAnalysisPage from './VideoAnalysisPage';
import { fetchHealth, fetchStats } from '../services/api';

export default function Dashboard({ onGoToLanding, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [healthData, setHealthData] = useState({ status: 'checking', mode: 'demo', model_available: false });
  const [systemStats, setSystemStats] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const checkStatus = async () => {
    const health = await fetchHealth();
    setHealthData(health);
    
    const stats = await fetchStats();
    if (stats && stats.status === 'ok') {
      setSystemStats(stats.dataset);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const isLiveModel = healthData.model_available && (healthData.mode === 'live' || healthData.mode === 'ok');

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px 28px' }}>
      
      {/* NAVBAR */}
      <header style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        paddingBottom: '20px', 
        marginBottom: '28px', 
        borderBottom: '1px solid #e2e8f0', 
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        
        {/* LEFT: CoastX Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onGoToLanding}>
          <img src={logo} alt="CoastX Logo" style={{ height: '44px', width: 'auto', display: 'block' }} />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-navy)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              COASTX
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginTop: '2px' }}>
              AI COASTAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* APPLICATION NAVIGATION TABS */}
        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', background: 'var(--bg-cream)', padding: '6px', borderRadius: '50px', border: '1px solid #e2e8f0' }}>
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            DASHBOARD
          </button>
          <button 
            className={`nav-tab ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            IMAGE ANALYSIS
          </button>
          <button 
            className={`nav-tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            VIDEO ANALYSIS
          </button>
          <button 
            className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            EVENTS
          </button>
          <button 
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ABOUT
          </button>
        </nav>
      </header>

      {/* 1. DASHBOARD OVERVIEW PAGE */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Hero Command Center Header & Status */}
          <div style={{ 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '20px', 
            padding: '28px 32px', 
            background: 'linear-gradient(135deg, #ffffff 0%, #fcfbf9 100%)', 
            border: '1px solid #e2e8f0', 
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-ocean)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px' }}>
                COASTX COMMAND CENTER
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-navy)' }}>
                Detect. Track. Understand.
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                Real-time coastal scene intelligence powered by YOLO object detection and ByteTrack persistent analytics.
              </p>
            </div>

            {/* Service & Model Compact Status Indicators */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '0.82rem', 
                fontFamily: 'var(--font-mono)', 
                background: healthData.status === 'ok' ? '#ecfdf5' : '#fef2f2', 
                padding: '8px 16px', 
                borderRadius: '50px', 
                border: `1px solid ${healthData.status === 'ok' ? '#a7f3d0' : '#fecaca'}` 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthData.status === 'ok' ? '#10b981' : '#ef4444' }}></span>
                <span style={{ color: healthData.status === 'ok' ? '#047857' : '#b91c1c', fontWeight: 800 }}>
                  SERVICE ONLINE
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '0.82rem', 
                fontFamily: 'var(--font-mono)', 
                background: isLiveModel ? '#e0f2fe' : '#f8fafc', 
                padding: '8px 16px', 
                borderRadius: '50px', 
                border: `1px solid ${isLiveModel ? '#bae6fd' : '#cbd5e1'}` 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLiveModel ? '#0284c7' : '#64748b' }}></span>
                <span style={{ color: isLiveModel ? '#0369a1' : '#475569', fontWeight: 800 }}>
                  {isLiveModel ? 'LIVE MODEL' : 'DEMO MODE'}
                </span>
              </div>
            </div>
          </div>

          {/* SYSTEM OVERVIEW CARDS */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.04em' }}>
              SYSTEM OVERVIEW
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              
              <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-ocean)' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  MODEL
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-navy)' }}>
                  CoastX YOLO
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
                  Custom Deep Learning Detection Engine
                </div>
              </div>

              <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  DATASET
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-navy)' }}>
                  {systemStats ? `${systemStats.total_images.toLocaleString()} Images` : '8,393 Images'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
                  Train, Valid, Test splits
                </div>
              </div>

              <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-sand)' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  TARGET CLASSES
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-navy)', marginTop: '6px' }}>
                  <span style={{ color: '#ef4444' }}>Person</span> • <span style={{ color: '#3b82f6' }}>Plastic</span> • <span style={{ color: '#f97316' }}>Boat</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
                  Class-specific color bounding boxes
                </div>
              </div>

              <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  SYSTEM STATUS
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857' }}>
                  Online
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
                  FastAPI REST Engine Operational
                </div>
              </div>

            </div>
          </div>

          {/* COASTAL MONITORING & INFORMATION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            <div className="coastx-card" style={{ padding: '32px' }}>
              <h4 style={{ fontSize: '0.88rem', letterSpacing: '0.08em', color: 'var(--accent-ocean)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '14px' }}>
                COASTAL MONITORING & OBJECT INTELLIGENCE
              </h4>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-navy)', marginBottom: '8px' }}>
                ByteTrack Centroid Analytics
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                CoastX monitors aerial and shoreline visual feeds in real time. Detections are assigned persistent object tracking IDs to estimate speed, movement vector, and swimmer-vessel proximity without relying on artificial screen zones.
              </p>
            </div>

            <div className="coastx-card" style={{ padding: '32px', background: 'var(--bg-cream)' }}>
              <h4 style={{ fontSize: '0.88rem', letterSpacing: '0.08em', color: 'var(--accent-sand)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '14px' }}>
                DETECTION COLOR STANDARD
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#ef4444', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '0.95rem' }}>PERSON / SWIMMER = RED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f97316', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '0.95rem' }}>BOAT = ORANGE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#3b82f6', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '0.95rem' }}>PLASTIC = BLUE</span>
                </div>
              </div>
            </div>

          </div>

          {/* QUICK ANALYSIS NAVIGATION CARDS */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.04em' }}>
              ANALYSIS MODULES
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              <div 
                className="coastx-card" 
                onClick={() => setActiveTab('image')}
                style={{ padding: '32px', cursor: 'pointer', borderLeft: '6px solid var(--accent-ocean)', transition: 'all 0.25s ease' }}
              >
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-ocean)', fontWeight: 800, marginBottom: '8px' }}>
                  SINGLE FRAME PROCESSING
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-navy)', marginBottom: '8px' }}>
                  Image Analysis →
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  Upload coastal photography to detect swimmers, vessels, and plastic debris with object bounding boxes.
                </p>
              </div>

              <div 
                className="coastx-card" 
                onClick={() => setActiveTab('video')}
                style={{ padding: '32px', cursor: 'pointer', borderLeft: '6px solid var(--accent-teal)', transition: 'all 0.25s ease' }}
              >
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)', fontWeight: 800, marginBottom: '8px' }}>
                  DRONE FOOTAGE TRACKING
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-navy)', marginBottom: '8px' }}>
                  Video Analysis →
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  Upload video streams to run persistent ByteTrack tracking, visible count statistics, and distress risk indicators.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. DEDICATED IMAGE ANALYSIS PAGE */}
      {activeTab === 'image' && (
        <ImageAnalysisPage />
      )}

      {/* 3. DEDICATED VIDEO ANALYSIS PAGE */}
      {activeTab === 'video' && (
        <VideoAnalysisPage />
      )}

      {/* 4. DEDICATED EVENTS PAGE */}
      {activeTab === 'events' && (
        <EventsLogView />
      )}

      {/* 5. DEDICATED ABOUT PAGE */}
      {activeTab === 'about' && (
        <AboutView 
          stats={systemStats} 
          modelMode={isLiveModel ? 'live' : 'demo'}
        />
      )}

    </div>
  );
}
