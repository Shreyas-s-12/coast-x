import React, { useState } from 'react';
import { uploadImage } from '../services/api';
import DetectionView from '../components/DetectionView';
import RiskPanel from '../components/RiskPanel';
import AlertPanel from '../components/AlertPanel';

export default function ImageAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (.jpg, .jpeg, .png, .webp).');
      return;
    }

    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const response = await uploadImage(selectedFile);
      if (response && response.success !== false) {
        setAnalysisResult(response);
      } else {
        setErrorMessage(response?.error || 'Image detection analysis failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error communicating with CoastX backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Target object counts directly from backend counts object
  const objects = analysisResult?.objects || [];
  const counts = analysisResult?.counts || {};
  const personCount = counts.person ?? objects.filter(o => ['person', 'swimmer'].includes((o.class || '').toLowerCase())).length;
  const boatCount = counts.boat ?? objects.filter(o => ['boat', 'vessel'].includes((o.class || '').toLowerCase())).length;
  const plasticCount = counts.plastic ?? objects.filter(o => ['plastic', 'trash', 'debris'].includes((o.class || '').toLowerCase())).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* PAGE HEADER */}
      <div>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-ocean)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px' }}>
          SINGLE FRAME COMPUTER VISION
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-navy)', marginBottom: '6px' }}>
          IMAGE ANALYSIS
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
          Analyze a coastal image with CoastX computer vision.
        </p>
      </div>

      {/* UPLOAD & PREVIEW SECTION */}
      <div className="coastx-card" style={{ padding: '40px 32px', textAlign: 'center', backgroundColor: '#ffffff' }}>
        {!selectedFile ? (
          <div>
            <label 
              htmlFor="image-upload-input"
              style={{
                display: 'block',
                border: '2px dashed var(--border-aqua)',
                borderRadius: 'var(--radius-xl)',
                padding: '50px 24px',
                cursor: 'pointer',
                background: 'var(--bg-cream)',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.4rem', fontWeight: 800 }}>
                📷
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '8px' }}>
                UPLOAD IMAGE
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px auto', fontWeight: 500 }}>
                Select a coastal image to identify people, vessels, and plastic objects with deep learning.
              </p>
              
              <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                SELECT IMAGE FILE
              </button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '20px', fontWeight: 600 }}>
                Supported formats: JPG • JPEG • PNG • WEBP
              </div>
            </label>

            <input 
              id="image-upload-input"
              type="file" 
              accept="image/*,.jpg,.jpeg,.png,.webp" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-ocean)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              IMAGE PREVIEW — {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>

            {/* Local Image Preview */}
            <div style={{ maxWidth: '680px', width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: '#000', boxShadow: 'var(--shadow-card)' }}>
              <img src={previewUrl} alt="Selected Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, padding: '14px 36px', fontSize: '1rem' }}
              >
                {loading ? 'PROCESSING ANALYSIS...' : 'ANALYZE IMAGE'}
              </button>

              <button 
                className="btn-secondary"
                onClick={handleReset}
                disabled={loading}
                style={{ padding: '14px 28px', fontSize: '0.95rem' }}
              >
                CHOOSE DIFFERENT IMAGE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && (
        <div className="coastx-card" style={{ padding: '20px 24px', borderColor: '#fca5a5', background: '#fef2f2' }}>
          <div style={{ color: '#b91c1c', fontSize: '0.92rem', fontWeight: 700 }}>
            ⚠️ {errorMessage}
          </div>
        </div>
      )}

      {/* DETECTION RESULTS SECTION */}
      {analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="fade-in">
          
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '16px' }}>
              DETECTION RESULTS
            </h3>
            
            {/* STATS BREAKDOWN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              
              <div className="coastx-card" style={{ padding: '24px', borderLeft: '5px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800 }}>PEOPLE / SWIMMER</span>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                  {personCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Red bounding boxes
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '24px', borderLeft: '5px solid #f97316' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }}></span>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800 }}>BOATS / VESSELS</span>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-mono)' }}>
                  {boatCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Orange bounding boxes
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '24px', borderLeft: '5px solid #3b82f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800 }}>PLASTIC OBJECTS</span>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
                  {plasticCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Blue bounding boxes
                </div>
              </div>

            </div>
          </div>

          {/* ANNOTATED IMAGE & COASTAL RISK PANEL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            
            {/* ANNOTATED DETECTION IMAGE */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '12px' }}>
                ANNOTATED IMAGE
              </h3>
              <DetectionView data={analysisResult} />
            </div>

            {/* SIDE PANEL: RISK & ALERTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RiskPanel risk={analysisResult?.risk} />
              
              {/* WATER CONTEXT PANEL */}
              <div className="coastx-card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '0.88rem', letterSpacing: '0.06em', color: 'var(--accent-ocean)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '14px' }}>
                  WATER CONTEXT & OBSERVED PATTERNS
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Person in water:</span>
                    <span style={{ fontWeight: 800, color: personCount > 0 ? '#0284c7' : 'var(--text-muted)' }}>
                      {personCount > 0 ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Water visibility:</span>
                    <span style={{ fontWeight: 700 }}>Shallow-looking coastal water</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Vessel proximity:</span>
                    <span style={{ fontWeight: 700, color: (personCount > 0 && boatCount > 0) ? '#d97706' : '#059669' }}>
                      {(personCount > 0 && boatCount > 0) ? 'Observed near swimmers' : 'Clear distance'}
                    </span>
                  </div>
                </div>
              </div>

              <AlertPanel alerts={analysisResult?.risk?.alerts} />
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
