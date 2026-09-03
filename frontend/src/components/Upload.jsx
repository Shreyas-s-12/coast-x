import React, { useState, useRef } from 'react';
import { uploadImage, uploadVideo } from '../services/api';

export default function Upload({ onAnalysisStart, onAnalysisComplete, onError }) {
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleUpload = async (file, type) => {
    if (!file) return;

    if (type === 'image' && !file.type.startsWith('image/')) {
      onError('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      onError('Please select a valid video file (.mp4, .mov, .avi, .webm).');
      return;
    }

    setLoading(true);
    setActiveType(type);
    if (onAnalysisStart) onAnalysisStart();

    try {
      let response;
      if (type === 'video') {
        response = await uploadVideo(file);
      } else {
        response = await uploadImage(file);
      }

      if (response && response.success !== false) {
        onAnalysisComplete(response);
      } else {
        onError(response?.error || 'Coastal analysis failed.');
      }
    } catch (err) {
      onError(err.message || 'Error communicating with CoastX backend.');
    } finally {
      setLoading(false);
      setActiveType(null);
    }
  };

  return (
    <div className="coastx-card" style={{ textAlign: 'center', padding: '40px 24px', backgroundColor: '#ffffff' }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-navy)', fontWeight: 900, letterSpacing: '0.04em' }}>
        COASTAL MEDIA INGESTION
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', maxWidth: '560px', margin: '0 auto 28px auto', lineHeight: '1.6', fontWeight: 500 }}>
        Analyze coastal images and drone footage with AI-powered computer vision.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          className="btn-primary"
          onClick={() => imageInputRef.current?.click()}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading && activeType === 'image' ? 'PROCESSING IMAGE...' : 'UPLOAD IMAGE'}
        </button>
        <input 
          type="file" 
          ref={imageInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={(e) => handleUpload(e.target.files[0], 'image')} 
        />

        <button 
          className="btn-secondary"
          onClick={() => videoInputRef.current?.click()}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading && activeType === 'video' ? 'PROCESSING VIDEO...' : 'UPLOAD VIDEO'}
        </button>
        <input 
          type="file" 
          ref={videoInputRef} 
          accept="video/*" 
          style={{ display: 'none' }} 
          onChange={(e) => handleUpload(e.target.files[0], 'video')} 
        />
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        Supported: JPG • PNG • MP4 • MOV • WEBP
      </div>
    </div>
  );
}
