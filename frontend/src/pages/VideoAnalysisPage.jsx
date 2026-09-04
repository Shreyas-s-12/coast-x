import React, { useState } from 'react';
import { uploadVideo } from '../services/api';
import DetectionView from '../components/DetectionView';
import RiskPanel from '../components/RiskPanel';
import AlertPanel from '../components/AlertPanel';

export default function VideoAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExts = ['.mp4', '.mov', '.avi', '.webm'];
    const isVideoExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!file.type.startsWith('video/') && !isVideoExt) {
      setErrorMessage('Please select a valid video file (.mp4, .mov, .avi, .webm).');
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
      const response = await uploadVideo(selectedFile);
      if (response && response.success !== false) {
        setAnalysisResult(response);
      } else {
        setErrorMessage(response?.error || 'Video detection analysis failed.');
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

  // Metrics extracted from backend metrics object
  const m = analysisResult?.metrics || {};
  const framesProcessed = analysisResult?.frames_processed ?? 0;
  const rawFrameDetections = analysisResult?.raw_frame_detections ?? 0;

  const currentPeople = m.current_people ?? 0;
  const peakPeople = m.peak_people ?? 0;
  const averagePeople = m.average_people ?? 0;
  const confirmedPeople = m.confirmed_tracked_people ?? analysisResult?.unique_people ?? 0;

  const currentBoats = m.current_boats ?? 0;
  const peakBoats = m.peak_boats ?? analysisResult?.unique_boats ?? 0;

  const currentPlastic = m.current_plastic ?? 0;
  const peakPlastic = m.peak_plastic ?? analysisResult?.unique_plastic ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* PAGE HEADER */}
      <div>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-teal)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px' }}>
          PERSISTENT BYTETRACKING
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-navy)', marginBottom: '6px' }}>
          VIDEO ANALYSIS
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
          Analyze coastal and drone footage with CoastX persistent tracking and temporal intelligence.
        </p>
      </div>

      {/* UPLOAD & PREVIEW SECTION */}
      <div className="coastx-card" style={{ padding: '40px 32px', textAlign: 'center', backgroundColor: '#ffffff' }}>
        {!selectedFile ? (
          <div>
            <label 
              htmlFor="video-upload-input"
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
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.4rem', fontWeight: 800 }}>
                🎥
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '8px' }}>
                UPLOAD VIDEO
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px auto', fontWeight: 500 }}>
                Select coastal or drone footage for persistent object tracking and metrics calculation.
              </p>
              
              <button className="btn-primary" style={{ pointerEvents: 'none', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' }}>
                SELECT VIDEO FILE
              </button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '20px', fontWeight: 600 }}>
                Supported formats: MP4 • MOV • AVI • WEBM
              </div>
            </label>

            <input 
              id="video-upload-input"
              type="file" 
              accept="video/*,.mp4,.mov,.avi,.webm" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              VIDEO PREVIEW — {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>

            {/* Local Video Preview */}
            <div style={{ maxWidth: '680px', width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: '#000', boxShadow: 'var(--shadow-card)' }}>
              <video src={previewUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, padding: '14px 36px', fontSize: '1rem' }}
              >
                {loading ? 'PROCESSING FOOTAGE (YOLO BYTETRACK)...' : 'ANALYZE VIDEO'}
              </button>

              <button 
                className="btn-secondary"
                onClick={handleReset}
                disabled={loading}
                style={{ padding: '14px 28px', fontSize: '0.95rem' }}
              >
                CHOOSE DIFFERENT VIDEO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && (
        <div className="coastx-card" style={{ padding: '20px 24px', borderColor: '#fca5a5', background: '#fef2f2' }}>
          <div style={{ color: '#b91c1c', fontSize: '0.92rem', fontWeight: 700 }}>
            ⚠️ VIDEO PROCESSING FAILED: {errorMessage}
          </div>
        </div>
      )}

      {/* VIDEO ANALYSIS RESULTS SECTION */}
      {analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="fade-in">
          
          <div>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '16px' }}>
              VIDEO ANALYSIS METRICS
            </h3>

            {/* STATS SUMMARY GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '18px' }}>
              
              <div className="coastx-card" style={{ padding: '22px' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
                  FRAMES PROCESSED
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                  {framesProcessed}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                  Processed video frames
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '22px', borderLeft: '5px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 800, marginBottom: '4px' }}>
                  PEOPLE METRICS
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                  {confirmedPeople}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Confirmed Tracked: <strong>{confirmedPeople}</strong><br />
                  Peak Visible: <strong>{peakPeople}</strong> | Avg: <strong>{averagePeople}</strong>
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '22px', borderLeft: '5px solid #3b82f6' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#3b82f6', fontWeight: 800, marginBottom: '4px' }}>
                  PLASTIC METRICS
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
                  {peakPlastic}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Peak Visible: <strong>{peakPlastic}</strong><br />
                  Current Visible: <strong>{currentPlastic}</strong>
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '22px', borderLeft: '5px solid #f97316' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#f97316', fontWeight: 800, marginBottom: '4px' }}>
                  BOAT METRICS
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-mono)' }}>
                  {peakBoats}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  Peak Visible: <strong>{peakBoats}</strong><br />
                  Current Visible: <strong>{currentBoats}</strong>
                </div>
              </div>

              <div className="coastx-card" style={{ padding: '22px', borderLeft: '5px solid #64748b' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
                  RAW DETECTIONS
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  {rawFrameDetections}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                  Raw frame detections (Debug)
                </div>
              </div>

            </div>
          </div>

          {/* ANNOTATED VIDEO PLAYER & POTENTIAL DISTRESS GRID */}
          <div className="analysis-results-grid">
            
            {/* ANNOTATED DETECTION FEED */}
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', fontWeight: 800, marginBottom: '12px' }}>
                ANNOTATED DETECTION FEED
              </h3>
              <DetectionView data={analysisResult} />
            </div>

            {/* SIDE PANEL: RISK & POTENTIAL DISTRESS EVALUATION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              <RiskPanel risk={analysisResult?.risk} />
              
              {/* POTENTIAL DISTRESS PANEL */}
              <div className="coastx-card" style={{ padding: '20px 24px' }}>
                <h4 style={{ fontSize: '0.85rem', letterSpacing: '0.06em', color: 'var(--accent-teal)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>
                  POTENTIAL DISTRESS ASSESSMENT
                </h4>
                
                <div style={{ marginBottom: '12px' }}>
                  <span className={`badge ${
                    (analysisResult?.risk?.level || 'LOW') === 'HIGH' ? 'badge-high' :
                    (analysisResult?.risk?.level || 'LOW') === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                  }`} style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                    POTENTIAL DISTRESS: {analysisResult?.risk?.level || 'LOW'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  Evaluated using trajectory speed and persistent tracking metrics across processed video frames.
                </p>
              </div>

              <AlertPanel alerts={analysisResult?.risk?.alerts} />
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
