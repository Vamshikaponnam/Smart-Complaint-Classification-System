import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { 
  getMyComplaints, getAllComplaints, updateStatus, deleteComplaint, 
  getAiSuggestion, getAiInsights, getAiStatus, searchSemantic, 
  getFeedbackAnalysis, getAiDraft, getZonalHealth, getPredictiveForecast,
  getUserImpact, getUserImpactReport, getNextWeekStrategy, getAnomalyAlerts,
  getValueSaved, triggerVendorHandoff, redeemPerk, getDailyRoute,
  getSustainability, getProposals, voteProposal, triggerOracle,
  getBenchmarks, pledgeProposal, getLedger
} from '../api';

const CATEGORY_ICONS = {
  Water: '💧', Electricity: '⚡', Roads: '🛣️',
  Sanitation: '🗑️', Others: '📋'
};

const STATUS_FLOW = ['Pending', 'In Progress', 'Resolved'];

function StatusBadge({ status }) {
  const map = {
    'Pending':     'badge-pending',
    'In Progress': 'badge-progress',
    'Resolved':    'badge-resolved',
  };
  const icons = { 'Pending': '⏳', 'In Progress': '🔧', 'Resolved': '✅' };
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      {icons[status] || '⏳'} {status}
    </span>
  );
}

function CategoryBadge({ category }) {
  const map = {
    Water: 'badge-water', Electricity: 'badge-electricity',
    Roads: 'badge-roads', Sanitation: 'badge-sanitation', Others: 'badge-others',
  };
  return (
    <span className={`badge ${map[category] || 'badge-others'}`}>
      {CATEGORY_ICONS[category] || '📋'} {category}
    </span>
  );
}

function AnalyticsPanel({ complaints }) {
  const [insights, setInsights] = useState('');
  const [loading, setLoading]   = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await getAiInsights();
      setInsights(res.data.insights);
    } catch {
      setInsights('⚠️ Failed to generate insights. Is Smart AI configured?');
    } finally {
      setLoading(false);
    }
  };

  // Group by department
  const depts = {};
  complaints.forEach(c => {
    if (!depts[c.department]) depts[c.department] = { total: 0, resolved: 0, ratings: [] };
    depts[c.department].total++;
    if (c.status === 'Resolved') depts[c.department].resolved++;
    if (c.rating) depts[c.department].ratings.push(c.rating);
  });

  const sortedDepts = Object.entries(depts).map(([name, data]) => {
    const efficiency = Math.round((data.resolved / data.total) * 100);
    const avgRating = data.ratings.length > 0
      ? (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
      : 'N/A';
    return { name, efficiency, avgRating, ...data };
  }).sort((a, b) => b.efficiency - a.efficiency);

  const satisfaction = sortedDepts.reduce((acc, d) => acc + (d.avgRating === 'N/A' ? 0 : parseFloat(d.avgRating)), 0) / sortedDepts.length || 0;
  const satisfactionIcon = satisfaction >= 4.5 ? '🌟' : satisfaction >= 3.5 ? '😊' : '😐';

  return (
    <div className="analytics-panel animate-fade-down" style={{ 
      background: 'var(--bg-card)', 
      borderRadius: 'var(--radius-lg)', 
      padding: '24px', 
      marginBottom: '32px',
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Departmental Intelligence
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-sm"
            onClick={generateInsights}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(124,58,237,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: 'var(--primary)',
              fontWeight: 700,
              padding: '6px 16px'
            }}
          >
            {loading ? <><span className="spinner" style={{width: '14px', height: '14px', borderWidth: '2px'}} /> Analyzing...</> : '🤖 AI Strategic Report'}
          </button>
          <div style={{ background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            Citizen Satisfaction: <strong>{satisfaction.toFixed(1)} {satisfactionIcon}</strong>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {sortedDepts.map(dept => (
          <div key={dept.name} style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{dept.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>{dept.efficiency}% Efficiency</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ 
                height: '100%', 
                width: `${dept.efficiency}%`, 
                background: `linear-gradient(90deg, var(--primary), var(--secondary))`,
                boxShadow: '0 0 10px var(--primary-glow)',
                transition: 'width 1s ease'
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>⭐ Avg. Rating: <strong>{dept.avgRating}</strong></span>
              <span>📦 Total Tasks: {dept.total}</span>
            </div>
          </div>
        ))}
      </div>

      {insights && (
        <div className="insights-report animate-slide-up" style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(124,58,237,0.08))',
          borderRadius: '16px',
          border: '1px solid rgba(99,102,241,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glow pulse */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'var(--primary-glow)',
            filter: 'blur(60px)',
            opacity: 0.4,
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />

          <h3 style={{ 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: 'var(--primary)', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            🏢 Strategic Infrastructure Report — AI Generated
          </h3>
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.95rem', 
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap'
          }}>
            {insights}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function ComplaintCard({ complaint, onAction, onStatusUpdate, onFeedbackSubmit, onDelete, isAdmin }) {
  const [updating, setUpdating] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading]       = useState(false);

  const isResolved = complaint.status === 'Resolved';
  const hasFeedback = complaint.rating !== null && complaint.rating !== undefined;

  const isTranslated = complaint.detectedLanguage && complaint.detectedLanguage !== 'English' && complaint.detectedLanguage !== 'Unknown' && complaint.detectedLanguage !== 'English (Fallback)';

  const fetchAiSuggestion = async () => {
    if (aiSuggestion) return; // already loaded
    setAiLoading(true);
    try {
      const res = await getAiSuggestion(complaint.id);
      setAiSuggestion(res.data.suggestion || 'No suggestion available.');
    } catch {
      setAiSuggestion('⚠️ Could not fetch AI suggestion. Is the backend running?');
    } finally {
      setAiLoading(false);
    }
  };

  const submitFeedback = () => {
    onFeedbackSubmit(complaint.id, rating, comment);
    setShowFeedbackForm(false);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await onStatusUpdate(complaint.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`complaint-card animate-fade-up ${complaint.isEmergency ? 'emergency-pulse' : ''}`}>
      <div className="complaint-card-header">
        <div>
          {complaint.isEmergency && (
            <div className="emergency-badge">
              🚨 EMERGENCY — IMMEDIATE ACTION REQUIRED
            </div>
          )}
          <div className="complaint-card-meta" style={{ marginBottom: '6px' }}>
            <span className="complaint-id">Complaint #{complaint.id}</span>
            <CategoryBadge category={complaint.category} />
            <div style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              padding: '2px 6px', 
              borderRadius: '6px',
              marginLeft: '8px',
              background: `linear-gradient(90deg, #10b981 ${complaint.priorityScore * 10}%, rgba(255,255,255,0.1) 0%)`,
              border: '1px solid rgba(255,255,255,0.1)',
              color: complaint.priorityScore > 7 ? '#f87171' : '#fff'
            }}>
              PRIORITY: {complaint.priorityScore}/10
            </div>
            <StatusBadge status={complaint.status} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {complaint.isSystemAlert && (
              <span className="animate-pulse" style={{ 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', 
                background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444'
              }}>
                🏢 SYSTEM ALERT: PREVENTIVE
              </span>
            )}
            {complaint.isViralRisk && (
              <span className="animate-glow" style={{ 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', 
                background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                ⚠️ VIRAL RISK
              </span>
            )}
            {complaint.isAIVerified && (
              <span style={{ 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', 
                background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                🛡️ AI VERIFIED • {complaint.integrityScore}% INTEGRITY
              </span>
            )}
            {complaint.isDispatched && (
              <span className="animate-pulse" style={{ 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', 
                background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                📡 DISPATCHED TO DEPT HEAD
              </span>
            )}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {complaint.name}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px', fontSize: '0.85rem' }}>
              {complaint.email} • {complaint.mobileNumber || 'N/A'}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {complaint.status !== 'Resolved' && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                onClick={() => {
                  const nextStatus = complaint.status === 'Pending' ? 'In Progress' : 'Resolved';
                  onAction(complaint.id, nextStatus);
                }}
                disabled={updating}
              >
                ⚡ Simulate Action
              </button>
            )}
            <select
              className="status-select"
              value={complaint.status}
              onChange={handleStatusChange}
              disabled={updating}
            >
              {STATUS_FLOW.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              onClick={() => onDelete(complaint.id)}
              title="Delete complaint"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <p style={{ 
          margin: 0, 
          fontSize: '0.95rem', 
          lineHeight: '1.6', 
          color: 'var(--text-secondary)',
          fontStyle: (isTranslated && !showOriginal) ? 'italic' : 'normal'
        }}>
          {(isTranslated && !showOriginal) ? complaint.translatedText : complaint.complaintText}
        </p>
        
        {isTranslated && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary)',
              fontWeight: 600
            }}>
              🌐 Translated from {complaint.detectedLanguage}
            </span>
            <button 
              onClick={() => setShowOriginal(!showOriginal)}
              style={{ 
                background: 'none', border: 'none', padding: 0, color: 'var(--primary)', 
                fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' 
              }}
            >
              {showOriginal ? '📄 Hide Original' : '📄 View Original'}
            </button>
          </div>
        )}

        {complaint.imageData && (
          <div style={{ marginTop: '16px' }}>
            <img 
              src={`data:image/jpeg;base64,${complaint.imageData}`} 
              alt="Complaint Evidence"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '12px', 
                border: '1px solid var(--border)',
                cursor: 'zoom-in'
              }}
              onClick={(e) => window.open(e.target.src, '_blank')}
            />
          </div>
        )}
      </div>

      {/* AI Reasoning Badge */}
      {complaint.aiReasoning && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: 'var(--primary)',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '20px',
          padding: '4px 10px',
          marginTop: '2px',
          marginBottom: '6px',
          fontStyle: 'italic',
          boxShadow: '0 0 8px rgba(99,102,241,0.15)'
        }}>
          🤖 {complaint.aiReasoning}
        </div>
      )}

      {/* Timeline Toggle Button */}
      <div style={{ marginTop: '8px' }}>
        <button 
          onClick={() => setShowTimeline(!showTimeline)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary)', 
            fontSize: '0.8rem', 
            cursor: 'pointer', 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}
        >
          {showTimeline ? '▲ Hide History' : '▼ View Audit Trail'}
        </button>
      </div>

      {showTimeline && (
        <div className="timeline-container animate-fade-down">
          <div className="timeline-header">
            📜 History Log
          </div>
          <div className="timeline-list">
            {complaint.history && complaint.history.length > 0 ? (
              complaint.history.map((event, idx) => (
                <div key={idx} className={`timeline-item ${idx === complaint.history.length - 1 ? 'active' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="timeline-status">{event.status}</span>
                      <span className="timeline-time">{timeAgo(event.timestamp)}</span>
                    </div>
                    <div className="timeline-msg">{event.message}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No history records found.</div>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestion — Admin Only */}
      {isAdmin && (
        <div style={{ marginTop: '10px' }}>
          <button
            id={`ai-suggest-btn-${complaint.id}`}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            onClick={fetchAiSuggestion}
            disabled={aiLoading}
          >
            {aiLoading
              ? <><span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> Thinking...</>
              : '✨ Get AI Suggestion'
            }
          </button>

          {aiSuggestion && (
            <div style={{
              marginTop: '10px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.08))',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🤖 AI Resolution Suggestion
              </div>
              {aiSuggestion}
            </div>
          )}
        </div>
      )}

      {isResolved && hasFeedback && (
        <div className="feedback-display" style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span className={`badge badge-${complaint.status.toLowerCase().replace(' ', '-')}`}>
              {complaint.status === 'Resolved' ? '✅' : complaint.status === 'In Progress' ? '🔧' : '⏳'} {complaint.status}
            </span>
            {complaint.supportCount > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🤝 {complaint.supportCount} Supports
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(complaint.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--success)' }}>
              {'⭐'.repeat(complaint.rating)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Citizen Feedback
            </span>
          </div>
          {complaint.priorityScore > 7 && (
            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 900, marginBottom: '4px' }}>AI FUTURE SIMULATION (INACTION COST)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                "If unresolved for 180 days, municipal waste-treatment cost in {complaint.cityZone} will spike by 15% due to secondary infrastructure failure."
              </div>
            </div>
          )}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{complaint.category}</h3>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{complaint.feedback || 'No comment provided.'}"
          </p>
        </div>
      )}

      {isResolved && !hasFeedback && !showFeedbackForm && (
        <div style={{ marginTop: '16px' }}>
          <button 
            className="btn btn-primary btn-sm" 
            style={{ width: 'auto' }}
            onClick={() => setShowFeedbackForm(true)}
          >
            ⭐ Rate Performance
          </button>
        </div>
      )}

      {showFeedbackForm && (
        <div className="feedback-form animate-fade-down" style={{ 
          marginTop: '16px', 
          padding: '16px', 
          background: 'var(--bg-surface)', 
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>How was the resolution?</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                onClick={() => setRating(star)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer',
                  opacity: rating >= star ? 1 : 0.3,
                  transition: 'var(--transition)'
                }}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea 
            className="form-control"
            placeholder="Leave a comment (optional)..."
            style={{ fontSize: '0.85rem', minHeight: '60px', marginBottom: '12px' }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-success btn-sm" 
              onClick={() => {
                onFeedbackSubmit(complaint.id, rating, comment);
                setShowFeedbackForm(false);
              }}
              disabled={!rating}
            >
              Submit Feedback
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowFeedbackForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isAdmin && !isResolved && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => onStatusUpdate(complaint.id, 'Resolved')}>Check Resolve</button>
          {!complaint.externalVendor && (
            <button 
              className="btn btn-sm" 
              onClick={() => onAction(complaint.id, 'handoff')}
              style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--primary)' }}
            >
              📡 Sovereign Dispatch
            </button>
          )}
          {complaint.externalVendor && (
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
              📡 ACTIVE HANDOFF: {complaint.externalVendor}
            </div>
          )}
        </div>
      )}

      <div className="complaint-footer">
        <div className="complaint-details">
          <span className="complaint-detail-item">📍 {complaint.location}</span>
          <span className="complaint-detail-item">🏢 {complaint.department}</span>
          <span className="complaint-detail-item">🕐 {formatDate(complaint.createdAt)} ({timeAgo(complaint.createdAt)})</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('mine');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiFiltered, setAiFiltered] = useState(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [zonalHealth, setZonalHealth] = useState(null);
  const [selectedZone, setSelectedZone] = useState('All');
  const [forecast, setForecast] = useState('');
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [userImpact, setUserImpact] = useState(null);
  const [impactReport, setImpactReport] = useState('');
  const [loadingImpactReport, setLoadingImpactReport] = useState(false);
  const [nextWeekStrategy, setNextWeekStrategy] = useState('');
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [anomalyAlerts, setAnomalyAlerts] = useState([]);
  const [governanceValue, setGovernanceValue] = useState(null);
  const [dailyRoute, setDailyRoute] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [sustainability, setSustainability] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [showReferendum, setShowReferendum] = useState(false);
  const [benchmarks, setBenchmarks] = useState(null);
  const [pledgeAmount, setPledgeAmount] = useState(100);

  const isAdmin = tab === 'all';

  const fetchUserImpact = async () => {
    try {
      const res = await getUserImpact(user.email);
      setUserImpact(res.data.impact);
    } catch {
      console.error("Impact fetch failed");
    }
  };

  const fetchForecast = async () => {
    setLoadingForecast(true);
    try {
      const res = await getPredictiveForecast();
      setForecast(res.data.forecast);
    } catch {
      setForecast('⚠️ Could not generate municipal forecast.');
    } finally {
      setLoadingForecast(false);
    }
  };


  const fetchZonalHealth = async () => {
    try {
      const res = await getZonalHealth();
      setZonalHealth(res.data.data);
    } catch {
      console.error("Zonal health fetch failed");
    }
  };

  const fetchAnomalyAlerts = async () => {
    try {
      const res = await getAnomalyAlerts();
      setAnomalyAlerts(res.data.alerts);
    } catch {
      console.error("Alerts fetch failed");
    }
  };

  const fetchImpactReport = async () => {
    setLoadingImpactReport(true);
    try {
      const res = await getUserImpactReport(user.email);
      setImpactReport(res.data.report);
    } catch {
      setImpactReport('⚠️ Could not generate impact report.');
    } finally {
      setLoadingImpactReport(false);
    }
  };

  const fetchStrategy = async () => {
    setLoadingStrategy(true);
    try {
      const res = await getNextWeekStrategy();
      setNextWeekStrategy(res.data.strategy);
    } catch {
      setNextWeekStrategy('⚠️ Could not generate next-week strategy.');
    } finally {
      setLoadingStrategy(false);
    }
  };

  const fetchGovernanceValue = async () => {
    try {
      const res = await getValueSaved();
      setGovernanceValue(res.data.data);
    } catch {
      console.error("Value fetch failed");
    }
  };

  const fetchDailyRoute = async () => {
    setLoadingRoute(true);
    try {
      const res = await getDailyRoute();
      setDailyRoute(res.data.route);
    } catch {
      setDailyRoute('⚠️ Could not generate daily route.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleHandoff = async (id) => {
    try {
      await triggerVendorHandoff(id);
      setAlert({ type: 'success', msg: '📡 Sovereign Handoff: Autonomous dispatch to vendor successful!' });
      fetchComplaints();
    } catch {
      setAlert({ type: 'error', msg: 'Handoff failed.' });
    }
  };

  const handleRedeem = async (perk) => {
    try {
      await redeemPerk({ email: user.email, perkName: perk });
      setAlert({ type: 'success', msg: `💰 Perk '${perk}' redeemed! Check your email.` });
      setShowMarketplace(false);
    } catch {
      setAlert({ type: 'error', msg: 'Redemption failed.' });
    }
  };

  const fetchSustainability = async () => {
    try {
      const res = await getSustainability();
      setSustainability(res.data);
    } catch {
      console.error("Sustainability fetch failed");
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await getProposals();
      setProposals(res.data);
    } catch {
      console.error("Proposals fetch failed");
    }
  };

  const handleVote = async (id) => {
    try {
      await voteProposal(id, user.email);
      setAlert({ type: 'success', msg: '🗳️ Vote cast locally! Thank you for participating.' });
      setShowReferendum(false);
    } catch {
      setAlert({ type: 'error', msg: 'Voting failed.' });
    }
  };

  const handleRunOracle = async () => {
    try {
      await triggerOracle();
      setAlert({ type: 'success', msg: '🏢 Oracle Task: Preventive infrastructure check complete and alert generated!' });
      fetchComplaints();
    } catch {
      setAlert({ type: 'error', msg: 'Oracle failed.' });
    }
  };

  const fetchBenchmarks = async () => {
    try {
      const res = await getBenchmarks();
      setBenchmarks(res.data);
    } catch {
      console.error("Benchmarks fetch failed");
    }
  };

  const handlePledge = async (id) => {
    try {
      await pledgeProposal(id, { email: user.email, points: pledgeAmount });
      setAlert({ type: 'success', msg: `💰 Pledged ${pledgeAmount} points! You are a city builder.` });
      setShowReferendum(false);
    } catch {
      setAlert({ type: 'error', msg: 'Pledge failed.' });
    }
  };


  // Debounced Semantic Search
  useEffect(() => {
    if (!isAiSearch || searchTerm.length < 3) {
      setAiFiltered(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiSearching(true);
      try {
        const res = await searchSemantic(searchTerm, tab === 'mine' ? user.email : null);
        setAiFiltered(res.data);
      } catch (err) {
        console.error("AI Search failed", err);
      } finally {
        setAiSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, isAiSearch, tab, user.email]);


  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'all') {
        res = await getAllComplaints();
      } else {
        res = await getMyComplaints(user.email);
      }
      setComplaints(res.data);
    } catch (err) {
      setAlert({ type: 'error', msg: 'Failed to load complaints. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  }, [tab, user.email]);

  useEffect(() => { 
    fetchComplaints(); 
    if (isAdmin) {
      fetchZonalHealth();
      fetchForecast();
      fetchAnomalyAlerts();
      fetchGovernanceValue();
      fetchSustainability();
      fetchProposals();
      fetchBenchmarks();
    } else {
      fetchUserImpact();
    }
  }, [fetchComplaints, isAdmin]);

  const handleStatusUpdate = async (id, status, note) => {
    try {
      await updateStatus(id, { status, note });
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, status } : c)
      );
      setAlert({ type: 'success', msg: `Complaint #${id} status updated to "${status}"` });
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to update status.' });
    }
  };

  const handleSimulateAction = async (id, nextStatus, note = '') => {
    await handleStatusUpdate(id, nextStatus, note);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c.id !== id));
      setAlert({ type: 'success', msg: `Complaint #${id} deleted.` });
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to delete complaint.' });
    }
  };

  // Stats
  const total     = complaints.length;
  const pending   = complaints.filter(c => c.status === 'Pending').length;
  const inProg    = complaints.filter(c => c.status === 'In Progress').length;
  const resolved  = complaints.filter(c => c.status === 'Resolved').length;

  // Filter
  const handleFeedbackSubmit = async (complaintId, rating, feedback) => {
    try {
      const resp = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      });
      const data = await resp.json();
      if (data.success) {
        setAlert({ type: 'success', msg: 'Thank you for your feedback!' });
        fetchComplaints(); // Re-fetch to update complaint with new feedback
      } else {
        setAlert({ type: 'error', msg: data.message || 'Failed to submit feedback.' });
      }
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', msg: 'Failed to submit feedback.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const exportData = () => {
    const headers = ['ID', 'Name', 'Email', 'Mobile', 'Location', 'Text', 'Category', 'Dept', 'Status', 'Rating'];
    const rows = complaints.map(c => [
      c.id, c.name, c.email, c.mobileNumber, c.location, 
      `"${c.complaintText.replace(/"/g, '""')}"`, 
      c.category, c.department, c.status, c.rating || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `complaints_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setAlert({ type: 'success', msg: 'Data exported successfully as CSV! 📥' });
    setTimeout(() => setAlert(null), 3000);
  };

  const filtered = aiFiltered || complaints.filter(c => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesZone = selectedZone === 'All' || c.cityZone === selectedZone;
    const matchesSearch = !searchTerm || 
      c.id.toString().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch && matchesZone;
  });

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📊 Complaint Dashboard</h1>
          <p>Hello, <strong>{user.name}</strong> — track and manage your complaints below.</p>
        </div>
        
        {isAdmin && governanceValue && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>MUNICIPAL VALUE SAVED (AI)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>${governanceValue.totalValue.toLocaleString()}</div>
            </div>
            {sustainability && (
              <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>MUNICIPAL SUSTAINABILITY</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>🌳 {sustainability.co2Saved} CO2 Saved</div>
              </div>
            )}
            <button 
              className="btn btn-sm" 
              onClick={handleRunOracle}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              🔮 Run Oracle
            </button>
            {benchmarks && (
              <div style={{ padding: '4px 12px', background: 'var(--primary)', borderRadius: '20px', color: '#000', fontSize: '0.65rem', fontWeight: 900 }}>
                {benchmarks.tier}
              </div>
            )}
          </div>
        )}

        {!isAdmin && userImpact && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              className="btn btn-sm"
              onClick={fetchImpactReport}
              disabled={loadingImpactReport}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {loadingImpactReport ? '✍️ Writing...' : '✨ Generate My Impact Story'}
            </button>
            <div className="animate-glow" style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: '12px 20px',
              borderRadius: '16px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Citizen Tier</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>🏅 {userImpact.tier}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>Impact Score: {userImpact.score}</span>
            </div>
          </div>
        )}
      </div>

      {impactReport && (
        <div className="animate-fade-down" style={{
          marginBottom: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          borderRadius: '24px',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <button onClick={() => setImpactReport('')} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📖 Your Municipal Impact Story
          </h2>
          <div style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.95, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
            {impactReport}
          </div>
          <div style={{ marginTop: '20px', fontSize: '0.75rem', opacity: 0.6 }}>
            Generated by Smart AI Citizen Insights • Thank you for making our city better!
          </div>
        </div>
      )}

      {anomalyAlerts.length > 0 && isAdmin && (
        <div style={{ marginBottom: '24px' }}>
          {anomalyAlerts.map((alert, i) => (
            <div key={i} className="animate-pulse" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <span>🚨</span> {alert}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📋" label="Total Complaints" value={total}
          color="linear-gradient(135deg,rgba(99,102,241,0.3),rgba(99,102,241,0.1))" />
        <StatCard icon="⏳" label="Pending" value={pending}
          color="linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))" />
        <StatCard icon="🔧" label="In Progress" value={inProg}
          color="linear-gradient(135deg,rgba(14,165,233,0.3),rgba(14,165,233,0.1))" />
        <StatCard icon="✅" label="Resolved" value={resolved}
          color="linear-gradient(135deg,rgba(16,185,129,0.3),rgba(16,185,129,0.1))" />
      </div>

      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <AnalyticsPanel complaints={complaints} />
          
          {/* Predictive Forecast Card */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              PREEMPTIVE INTEL
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔮 30-Day Municipal Forecast
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {loadingForecast ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', marginBottom: '8px', borderTopColor: '#a5b4fc' }}></div>
                  <div style={{ color: '#a5b4fc', fontSize: '0.75rem' }}>Gathering patterns...</div>
                </div>
              ) : forecast || 'Insufficient data for a reliable city forecast.'}
            </div>
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Powered by Smart AI Predictive Engine
            </div>
          </div>

          {/* Strategic Next-Week Card */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px', textTransform: 'uppercase' }}>
              🔮 Strategic Next-Week Dispatch
            </h3>
            {nextWeekStrategy ? (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {nextWeekStrategy}
              </div>
            ) : (
              <button 
                className="btn btn-sm" 
                onClick={fetchStrategy}
                disabled={loadingStrategy}
                style={{ width: '100%', padding: '12px' }}
              >
                {loadingStrategy ? '🧠 Thinking...' : '🔮 Generate Municipal Strategy'}
              </button>
            )}
          </div>

          {/* Daily Route Card */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px', textTransform: 'uppercase' }}>
              📍 Daily Maintenance Route
            </h3>
            {dailyRoute ? (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {dailyRoute}
              </div>
            ) : (
              <button 
                className="btn btn-sm" 
                onClick={fetchDailyRoute}
                disabled={loadingRoute}
                style={{ width: '100%', padding: '12px' }}
              >
                {loadingRoute ? '📍 Mapping...' : '📍 Generate Today\'s Route'}
              </button>
            )}
          </div>
        </div>
      )}


      {/* Zonal Heatmap Section */}
      {isAdmin && zonalHealth && (
        <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🗺️ City Infrastructure Health Map
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            {Object.entries(zonalHealth).map(([zone, data]) => (
              <div 
                key={zone}
                onClick={() => setSelectedZone(selectedZone === zone ? 'All' : zone)}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  background: selectedZone === zone ? 'var(--primary-glow)' : 'var(--bg-surface)',
                  border: `1px solid ${selectedZone === zone ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  borderTop: `4px solid ${data.status === 'Critical' ? '#ef4444' : data.status === 'Caution' ? '#f59e0b' : '#10b981'}`
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>{zone.toUpperCase()}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{data.health}%</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: data.status === 'Critical' ? '#ef4444' : 'var(--text-secondary)' }}>
                  {data.status} • {data.count} Issues
                </div>
              </div>
            ))}
          </div>
          {selectedZone !== 'All' && (
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍 Filtering for: <strong>{selectedZone} Zone</strong></span>
              <button onClick={() => setSelectedZone('All')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Clear Filter</button>
            </div>
          )}
        </div>
      )}


      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
          <span>{alert.type === 'error' ? '⚠️' : '✅'}</span>
          {alert.msg}
        </div>
      )}

      {/* Tabs + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="tabs">
          <button className={`tab-btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
            👤 My Complaints
          </button>
          <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            🌐 All Complaints
          </button>
          {isAdmin && (
            <button className="tab-btn" onClick={exportData} style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}>
              📥 Export CSV
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, name, or keywords..."
              style={{ paddingLeft: '36px', height: '38px', margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {aiSearching && (
              <div className="search-spinner" style={{
                position: 'absolute', right: '12px', top: '50%', 
                transform: 'translateY(-50%)', border: '2px solid var(--primary)', 
                borderTopColor: 'transparent', borderRadius: '50%', 
                width: '16px', height: '16px', animation: 'spin 1s linear infinite'
              }}></div>
            )}
          </div>
          
          <label className="ai-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isAiSearch ? 'var(--primary)' : 'var(--text-muted)' }}>
              🌐 Smart Search
            </span>
            <div className={`toggle-bg ${isAiSearch ? 'active' : ''}`}>
              <input type="checkbox" checked={isAiSearch} onChange={() => setIsAiSearch(!isAiSearch)} hidden />
              <div className="toggle-thumb" />
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
            <button
              key={s}
              className={`tab-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', borderWidth: '3px' }}></div>
          Loading complaints...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No complaints found</h3>
          <p>
            {tab === 'mine'
              ? 'You haven\'t submitted any complaints yet. Go ahead and submit one!'
              : 'No complaints match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filtered.map(c => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onAction={handleSimulateAction}
              onStatusUpdate={handleStatusUpdate}
              onFeedbackSubmit={handleFeedbackSubmit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
      {/* Civic Marketplace Overlay */}
      <button 
        className="chatbot-bubble marketplace-bubble"
        style={{ right: '90px' }}
        onClick={() => setShowMarketplace(o => !o)}
        title="Civic Marketplace"
      >
        💰
      </button>

      {showMarketplace && (
        <div className="chatbot-window marketplace-window animate-slide-up" style={{ right: '90px', maxHeight: '500px' }}>
          <div className="chatbot-header" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
            <span style={{ fontWeight: 900 }}>💰 Civic Marketplace</span>
            <button onClick={() => setShowMarketplace(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>✕</button>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Redeem your Citizen Impact Points for exclusive municipal perks!</p>
            {[
              { id: 1, name: 'Priority Support', cost: 500, emoji: '⚡' },
              { id: 2, name: 'Parks Monthly Pass', cost: 1200, emoji: '🌳' },
              { id: 3, name: 'Skip Filing Queue', cost: 300, emoji: '⏩' },
              { id: 4, name: 'Community Hero Badge', cost: 2000, emoji: '🛡️' }
            ].map(perk => (
              <div key={perk.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{perk.emoji} {perk.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>{perk.cost} Pts</div>
                </div>
                <button 
                  className="btn btn-sm" 
                  disabled={userImpact?.score < perk.cost}
                  onClick={() => handleRedeem(perk.name)}
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Referendum Overlay */}
      <button 
        className="chatbot-bubble referendum-bubble"
        style={{ right: '150px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        onClick={() => setShowReferendum(o => !o)}
        title="City Referendum Hub"
      >
        🏛️
      </button>

      {showReferendum && (
        <div className="chatbot-window referendum-window animate-slide-up" style={{ right: '150px', maxHeight: '500px', width: '380px' }}>
          <div className="chatbot-header" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <span style={{ fontWeight: 900 }}>🏛️ City Referendum Hub</span>
            <button onClick={() => setShowReferendum(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>✕</button>
          </div>
          <div style={{ padding: '20px' }}>
            {proposals ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>AI STRATEGIC PROPOSAL • #{proposals.proposalId}</span>
                <div style={{ fontSize: '0.9rem', color: '#fff', margin: '12px 0 20px', lineHeight: 1.6, minHeight: '120px' }}>
                  {proposals.content}
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: '12px', fontWeight: 800 }}
                  onClick={() => handleVote(proposals.proposalId)}
                >
                  🗳️ Vote for Implementation
                </button>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ fontSize: '0.8rem', width: '80px' }}
                    value={pledgeAmount}
                    onChange={e => setPledgeAmount(parseInt(e.target.value))}
                  />
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => handlePledge(proposals.proposalId)}>
                    💰 Pledge Pts
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Costs 500 Impact Points • Result affects Capital Budget
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>Loading Referendums...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
