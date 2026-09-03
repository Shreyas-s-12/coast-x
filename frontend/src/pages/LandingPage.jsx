import React, { useState } from 'react';
import logo from '../images/CoastX.png';
import heroCoastal from '../images/hero_coastal.png';
import impactCoastal from '../images/impact_coastal.png';
import coastalSample from '../images/coastal_sample.jpg';

export default function LandingPage({ onGoToDashboard }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* 1. NAVBAR */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'rgba(255, 255, 255, 0.92)', 
        borderBottom: '1px solid #e2e8f0', 
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* LEFT: CoastX Logo & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="CoastX Logo" style={{ height: '44px', width: 'auto', display: 'block' }} />
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-navy)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                COASTX
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginTop: '2px' }}>
                AI COASTAL INTELLIGENCE
              </span>
            </div>
          </div>

          {/* RIGHT: Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-nav">
            <button className="nav-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              HOME
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection('how-it-works')}>
              HOW IT WORKS
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection('features')}>
              FEATURES
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection('about')}>
              ABOUT
            </button>
            
            <button 
              className="btn-primary" 
              onClick={() => onGoToDashboard('dashboard')} 
              style={{ marginLeft: '12px' }}
              id="nav-get-started"
            >
              GET STARTED
            </button>
          </nav>

          {/* Mobile Hamburger toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: '1px solid #cbd5e1', color: 'var(--text-navy)', padding: '8px 14px', borderRadius: '50px', cursor: 'pointer', display: 'none', fontWeight: 700, fontSize: '0.85rem' }}
            className="mobile-hamburger"
          >
            MENU
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div style={{ padding: '20px 28px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="nav-link-btn" style={{ textAlign: 'left' }} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>HOME</button>
            <button className="nav-link-btn" style={{ textAlign: 'left' }} onClick={() => scrollToSection('how-it-works')}>HOW IT WORKS</button>
            <button className="nav-link-btn" style={{ textAlign: 'left' }} onClick={() => scrollToSection('features')}>FEATURES</button>
            <button className="nav-link-btn" style={{ textAlign: 'left' }} onClick={() => scrollToSection('about')}>ABOUT</button>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => onGoToDashboard('dashboard')}>GET STARTED</button>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ padding: '70px 24px 90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '56px', alignItems: 'center' }}>
          
          {/* Left Hero Content */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg-aqua-subtle)', border: '1px solid var(--border-aqua)', borderRadius: '50px', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-turquoise)' }}></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--accent-ocean)', textTransform: 'uppercase' }}>
                SMARTER COASTS. SAFER WATERS.
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', lineHeight: 1.08, fontWeight: 900, marginBottom: '24px', color: 'var(--text-navy)', fontFamily: 'var(--font-heading)' }}>
              COASTX<br />
              <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI COASTAL INTELLIGENCE
              </span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '36px', maxWidth: '580px', fontWeight: 500 }}>
              A vision-powered coastal monitoring system that understands what's happening on the water.
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '32px', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-navy)' }}>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '50px' }}>Detect</span> • 
              <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '4px 12px', borderRadius: '50px' }}>Track</span> • 
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '50px' }}>Analyze</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => onGoToDashboard('dashboard')} id="hero-get-started" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                GET STARTED
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection('how-it-works')} style={{ padding: '14px 32px', fontSize: '1rem' }}>
                EXPLORE SYSTEM
              </button>
            </div>
          </div>

          {/* 3. HERO DETECTION VISUAL (ILLUSTRATIVE UI DEMO) */}
          <div>
            <div style={{ 
              position: 'relative', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
              border: '4px solid #ffffff',
              backgroundColor: '#e0f2fe'
            }}>
              
              {/* Main Aerial Visual */}
              <img 
                src={heroCoastal || coastalSample} 
                alt="Coastal Drone Aerial View" 
                style={{ width: '100%', height: '460px', objectFit: 'cover', display: 'block' }} 
              />

              {/* Tag Banner explicitly marking demo visualization */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
                <span className="cv-demo-tag">
                  ILLUSTRATIVE UI DEMO — CONCEPT VISUALIZATION
                </span>
              </div>

              {/* OVERLAID ILLUSTRATIVE BOUNDING BOXES */}
              
              {/* BOAT 0.92 (ORANGE) */}
              <div className="cv-box-boat" style={{ top: '18%', left: '56%', width: '160px', height: '90px' }}>
                <div className="cv-label">BOAT 0.92</div>
              </div>

              {/* BOAT 0.87 (ORANGE) */}
              <div className="cv-box-boat" style={{ top: '64%', left: '14%', width: '130px', height: '80px' }}>
                <div className="cv-label">BOAT 0.87</div>
              </div>

              {/* SWIMMER 0.81 (RED) */}
              <div className="cv-box-person" style={{ top: '38%', left: '26%', width: '110px', height: '85px' }}>
                <div className="cv-label">SWIMMER 0.81</div>
              </div>

              {/* PLASTIC 0.76 (BLUE) */}
              <div className="cv-box-plastic" style={{ top: '68%', left: '68%', width: '100px', height: '70px' }}>
                <div className="cv-label">PLASTIC 0.76</div>
              </div>

              {/* Bottom Metadata Pill Overlay */}
              <div style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '16px', 
                right: '16px', 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center',
                fontSize: '0.78rem', 
                fontFamily: 'var(--font-mono)', 
                color: 'var(--text-navy)', 
                background: 'rgba(255, 255, 255, 0.92)', 
                backdropFilter: 'blur(8px)',
                padding: '10px 18px', 
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.8)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> PERSON = RED
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span> BOAT = ORANGE
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> PLASTIC = BLUE
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center', fontWeight: 500 }}>
              CoastX AI Object Detection Visualizer — Upload media in Dashboard for live predictions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTRODUCTION SECTION */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7 0%, #ccfbf1 50%, #e0f2fe 100%)', 
            borderRadius: '24px', 
            padding: '56px 40px',
            border: '1px solid rgba(14, 165, 233, 0.15)',
            boxShadow: '0 10px 30px -5px rgba(14, 165, 233, 0.08)'
          }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text-navy)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.02em' }}>
              EMPOWERING A SAFER, SMARTER COASTLINE.
            </h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--accent-turquoise)', margin: '0 auto 24px auto', borderRadius: '50px' }}></div>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--text-navy)', fontWeight: 700, marginBottom: '14px' }}>
              Built for people who care about the ocean.
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
              From public safety to coastal research, CoastX turns complex visuals into clear, actionable insights.
            </p>
          </div>

        </div>
      </section>

      {/* 5. WHAT COASTX DOES */}
      <section id="how-it-works" style={{ padding: '90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent-ocean)', textTransform: 'uppercase', marginBottom: '12px' }}>
            System Capabilities
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-navy)', fontWeight: 900, marginBottom: '16px' }}>
            What CoastX Does
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto', fontWeight: 500 }}>
            Turn aerial and coastal footage into meaningful information.
          </p>
        </div>

        {/* 4 Clean Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          
          <div className="process-step" style={{ backgroundColor: '#ffffff', borderColor: '#e0f2fe' }}>
            <div className="process-number" style={{ color: '#0284c7' }}>DETECT</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-navy)' }}>Object Detection</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Identify people, boats, plastic waste and other configured coastal objects in real-time.
            </p>
          </div>

          <div className="process-step" style={{ backgroundColor: '#ffffff', borderColor: '#ccfbf1' }}>
            <div className="process-number" style={{ color: '#0d9488' }}>TRACK</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-navy)' }}>Persistent Tracking</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Follow movement across video frames with ByteTrack persistent identity mapping.
            </p>
          </div>

          <div className="process-step" style={{ backgroundColor: '#ffffff', borderColor: '#fef3c7' }}>
            <div className="process-number" style={{ color: '#d97706' }}>ANALYZE</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-navy)' }}>Coastal Analytics</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Measure activity, movement patterns, swimmer density and coastal conditions.
            </p>
          </div>

          <div className="process-step" style={{ backgroundColor: '#ffffff', borderColor: '#dcfce7' }}>
            <div className="process-number" style={{ color: '#059669' }}>INFORM</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-navy)' }}>Actionable Insights</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Provide clear insights and threat assessments for better decision making.
            </p>
          </div>

        </div>
      </section>

      {/* 6. REAL-WORLD IMPACT */}
      <section id="features" style={{ padding: '90px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Environmental & Safety Impact
              </div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text-navy)', fontWeight: 900, marginBottom: '20px', lineHeight: 1.2 }}>
                Designed for Real-World Impact
              </h2>
              
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px', fontWeight: 500 }}>
                Whether it's crowd management, marine safety, or environmental monitoring — CoastX helps you see the bigger picture and act with confidence.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ background: '#e0f2fe', color: '#0284c7', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>✓</div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-navy)', fontWeight: 700 }}>Swimmer & Public Safety</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Identify swimmer distribution and potential distress patterns across water surfaces.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ background: '#ccfbf1', color: '#0f766e', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>✓</div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-navy)', fontWeight: 700 }}>Marine Plastics & Debris Detection</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Locate floating plastic waste to support ocean conservation and beach cleanups.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ background: '#fef3c7', color: '#b45309', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>✓</div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-navy)', fontWeight: 700 }}>Vessel & Boat Monitoring</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Track watercraft locations to prevent vessel-swimmer proximity hazards.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Coastal Photograph */}
            <div>
              <div style={{ 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow-card-hover)',
                border: '4px solid #ffffff'
              }}>
                <img 
                  src={impactCoastal || heroCoastal} 
                  alt="Coastal Impact Ocean Visual" 
                  style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ABOUT SYSTEM ARCHITECTURE */}
      <section id="about" style={{ padding: '90px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent-ocean)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Technology & Vision
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-navy)', fontWeight: 900 }}>
            Powered by Modern Computer Vision
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-ocean)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-navy)', marginBottom: '12px' }}>YOLO Detection Model</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Custom-trained YOLO deep learning model trained on 8,393 coastal images to detect swimmers, vessels, and plastic debris.
            </p>
          </div>

          <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-navy)', marginBottom: '12px' }}>ByteTrack Tracking Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              High-performance object tracking that assigns unique persistent IDs across video frames for accurate counting.
            </p>
          </div>

          <div className="coastx-card" style={{ borderLeft: '4px solid var(--accent-sand)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-navy)', marginBottom: '12px' }}>Transparent Risk Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Rule-based, interpretable threat assessment engine driven by object density, velocity, and vessel proximity.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL GET STARTED CTA */}
      <section style={{ padding: '96px 24px', textAlign: 'center', backgroundColor: '#e0f2fe', borderTop: '1px solid #bae6fd' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: '18px', color: 'var(--text-navy)' }}>
            TURN COASTAL FOOTAGE INTO INTELLIGENCE.
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '36px', fontWeight: 500 }}>
            Upload a coastal image or video stream to run AI analysis instantly.
          </p>
          <button className="btn-primary" style={{ padding: '16px 42px', fontSize: '1.05rem' }} onClick={() => onGoToDashboard('dashboard')} id="cta-get-started">
            GET STARTED
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={logo} alt="CoastX Footer Logo" style={{ height: '38px', width: 'auto' }} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-navy)', fontFamily: 'var(--font-heading)' }}>
                COASTX
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-teal)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI COASTAL INTELLIGENCE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="nav-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>HOME</button>
            <button className="nav-link-btn" onClick={() => scrollToSection('how-it-works')}>HOW IT WORKS</button>
            <button className="nav-link-btn" onClick={() => scrollToSection('features')}>FEATURES</button>
            <button className="nav-link-btn" onClick={() => scrollToSection('about')}>ABOUT</button>
            <button className="nav-link-btn" style={{ color: 'var(--accent-ocean)', fontWeight: 700 }} onClick={() => onGoToDashboard('dashboard')}>DASHBOARD</button>
          </div>

        </div>
      </footer>

    </div>
  );
}
