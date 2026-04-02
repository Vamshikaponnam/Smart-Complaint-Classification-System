import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { submitComplaint, checkSimilarity, supportComplaint } from '../api';

const CATEGORY_ICONS = {
  Water: '💧', Electricity: '⚡', Roads: '🛣️',
  Sanitation: '🗑️', Others: '📋'
};


export default function SubmitComplaint({ prefillText, clearPrefill }) {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [result, setResult]     = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    location: '',
    complaintText: prefillText || '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [simMatch, setSimMatch] = useState(null);
  const [checking, setChecking] = useState(false);

  // Debounced similarity check
  React.useEffect(() => {
    if (form.complaintText.length < 20 || !form.location) {
      setSimMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await checkSimilarity({ 
          complaintText: form.complaintText, 
          location: form.location 
        });
        if (res.data && res.data.id) {
          setSimMatch(res.data);
        } else {
          setSimMatch(null);
        }
      } catch (err) {
        console.error("Similarity check failed", err);
      } finally {
        setChecking(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [form.complaintText, form.location]);

  // Update text if prefill changes (e.g. from chatbot)
  React.useEffect(() => {
    if (prefillText) {
      setForm(f => ({ ...f, complaintText: prefillText }));
      if (clearPrefill) clearPrefill();
    }
  }, [prefillText, clearPrefill]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setAlert(null);
    setResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', msg: 'Image size must be less than 5MB.' });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.complaintText.trim().length < 20) {
      setAlert({ type: 'error', msg: 'Please provide at least 20 characters describing your complaint.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const formData = new FormData();
      const payload = { ...form, userId: user?.userId };
      formData.append('complaint', JSON.stringify(payload));
      if (image) {
        formData.append('image', image);
      }

      const res = await submitComplaint(formData);
      const data = res.data;
      setResult(data);
      setAlert({ type: 'success', msg: data.message });
      setForm(f => ({ ...f, location: '', complaintText: '' }));
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-layout">
      <h1 className="page-title">📝 Submit a Complaint</h1>
      <p className="page-subtitle">
        Describe your issue below and our AI will automatically classify it to the right department.
      </p>

      {alert && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          <span>{alert.type === 'error' ? '⚠️' : '✅'}</span>
          {alert.msg}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            🤖 <strong>Smart Engine:</strong> Our AI automatically handles categorization, community grouping, 
            and 🌐 <strong>multi-language support</strong>. Type in any language!
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Your Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>📱 Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>📍 Area / Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Sector 14, Main Road, Near Market"
              required
            />
          </div>

          <div className="form-group">
            <label>Complaint Description</label>
            <textarea
              name="complaintText"
              value={form.complaintText}
              onChange={handleChange}
              placeholder="Describe your complaint in detail... (e.g. 'There is a water leakage on the main road near sector 5')"
              required
              rows={5}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {form.complaintText.length} characters · min 20 required
            </div>
          </div>

          <div className="form-group">
            <label>📸 Upload Evidence (Optional)</label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg-surface)',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer'
                }}
              />
              {!imagePreview ? (
                <div style={{ color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '1.5rem', display: 'block' }}>📁</span>
                  Click or drag photo here (Max 5MB)
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxHeight: '150px', borderRadius: '8px' }} 
                  />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                    style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      background: '#ef4444', color: '#fff', border: 'none',
                      borderRadius: '50%', width: '24px', height: '24px',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 800
                    }}
                  >✕</button>
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 600 }}>
              🤖 AI Vision will analyze the photo to verify damage and speed up resolution.
            </div>
          </div>

          {/* AI Duplicate Detection Card */}
          {simMatch && (
            <div className="animate-slide-up" style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>
                ⚠️ Possible Duplicate Found
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                A similar issue was already reported in <strong>{simMatch.location}</strong>. 
                Category: <strong>{simMatch.category}</strong>. 
                Instead of filing a new one, you can support this existing report to raise its priority!
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await supportComplaint(simMatch.id);
                      setResult({ ...simMatch, status: 'Supported (Updated)' });
                      setAlert({ type: 'success', msg: 'Thank you! You have supported this existing issue.' });
                    } catch {
                      setAlert({ type: 'error', msg: 'Failed to support this issue.' });
                    } finally {
                      setLoading(false);
                      setSimMatch(null);
                    }
                  }}
                >
                  🤝 Support This Issue Instead
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline"
                  onClick={() => setSimMatch(null)}
                >
                  No, file mine
                </button>
              </div>
            </div>
          )}

          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            🤖 <strong>Smart Classification:</strong> Our AI will automatically detect the category
            (Water, Electricity, Roads, Sanitation) based on your description.
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner"></span> Submitting & Classifying...</>
              : '🚀 Submit Complaint'
            }
          </button>
        </form>
      </div>

      {result && (
        <div className="result-banner">
          <h3>🎯 AI Classification Result</h3>
          <div className="result-grid">
            <div className="result-item">
              <div className="label">Complaint ID</div>
              <div className="value">#{result.id}</div>
            </div>
            <div className="result-item">
              <div className="label">Category Detected</div>
              <div className="value">
                {CATEGORY_ICONS[result.category]} {result.category}
              </div>
            </div>
            <div className="result-item">
              <div className="label">Contact Info</div>
              <div className="value" style={{ fontSize: '0.85rem' }}>
                {result.name} ({result.mobileNumber})
              </div>
            </div>
            <div className="result-item">
              <div className="label">Assigned Department</div>
              <div className="value" style={{ fontSize: '0.85rem' }}>{result.department}</div>
            </div>
            <div className="result-item">
              <div className="label">Current Status</div>
              <div className="value">
                <span className="badge badge-pending">⏳ {result.status}</span>
              </div>
            </div>
            {result.aiReasoning && (
              <div className="result-item" style={{ gridColumn: '1 / -1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="label">🤖 AI Classification Reason</div>
                <div className="value" style={{ fontSize: '0.85rem', fontWeight: 500, fontStyle: 'italic' }}>
                  {result.aiReasoning}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
