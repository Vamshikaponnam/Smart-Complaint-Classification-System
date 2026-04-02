import React from 'react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content animate-fade-down">
          <div className="navbar-brand" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>⚖️</div>
            <span style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>SmartComplaint</span>
          </div>
          <h1 className="hero-title">Empowering Citizens through Smart Governance</h1>
          <p className="hero-subtitle">
            Experience the future of civic problem-solving. Our AI-driven platform 
            automatically classifies and routes your complaints to the right department in seconds.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" style={{ width: 'auto', padding: '16px 40px', fontSize: '1.1rem' }} onClick={onGetStarted}>
              Get Started for Free
            </button>
            <a href="#features" className="btn btn-secondary" style={{ width: 'auto', padding: '16px 40px', fontSize: '1.1rem' }}>
              Explore Features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper">🤖</div>
          <h3>AI Classification</h3>
          <p>Advanced keyword-based engine automatically routes your issues to the correct government department instantly.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">📊</div>
          <h3>Real-time Tracking</h3>
          <p>Monitor the progress of your complaints from submission to resolution with our transparent lifecycle dashboard.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">🏙️</div>
          <h3>Modern Experience</h3>
          <p>A sleek, responsive interface designed for the modern citizen. Accessible on any device, anytime.</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <p>&copy; {new Date().getFullYear()} SmartComplaint System · Your Voice Matters</p>
      </footer>
    </div>
  );
}
