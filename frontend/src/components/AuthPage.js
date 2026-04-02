import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { register, login } from '../api';

export default function AuthPage() {
  const { login: authLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', mobileNumber: '' });

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      let res;
      if (isLogin) {
        res = await login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) {
          setAlert({ type: 'error', msg: 'Please enter your full name.' });
          setLoading(false);
          return;
        }
        res = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          mobileNumber: form.mobileNumber
        });
      }

      const data = res.data;
      if (data.success) {
        setAlert({ type: 'success', msg: data.message });
        setTimeout(() => authLogin({
          userId: data.userId,
          name: data.name,
          email: data.email,
          mobileNumber: data.mobileNumber
        }), 600);
      } else {
        setAlert({ type: 'error', msg: data.message });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error. Make sure the backend is running.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setIsLogin(v => !v);
    setAlert(null);
    setForm({ name: '', email: '', password: '', mobileNumber: '' });
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="card-header">
          <div className="card-icon">🛡️</div>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="subtitle">
            {isLogin
              ? 'Sign in to manage your complaints'
              : 'Join to submit and track complaints'}
          </p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>
            <span>{alert.type === 'error' ? '⚠️' : '✅'}</span>
            {alert.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={4}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                placeholder="+91 98765 43210"
                value={form.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner"></span> Please wait...</>
              : isLogin ? '🔐 Sign In' : '🚀 Create Account'
            }
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}&nbsp;
          <button type="button" onClick={toggle}>
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
