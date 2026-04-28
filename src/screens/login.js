import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnverified(false);
    setResendStatus('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      props.onLogin(res.data.token);
    } catch (err) {
      if (err.response?.data?.error === 'unverified') {
        setUnverified(true);
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await axios.post(`${API}/auth/resend-verification`, { email });
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>AXIS</div>
        <div style={styles.subtitle}>Internal Navigation System</div>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          {unverified && (
            <div style={styles.unverifiedBox}>
              <div style={{ fontSize: '13px', color: '#D8E6F0', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>
                Please verify your email before logging in.
              </div>
              {resendStatus === '' && (
                <button type="button" style={styles.resendBtn} onClick={handleResend}>
                  Resend verification email
                </button>
              )}
              {resendStatus === 'sending' && <div style={{ fontSize: '12px', color: '#8BAFC8' }}>Sending...</div>}
              {resendStatus === 'sent' && <div style={{ fontSize: '12px', color: '#4AAE88' }}>✓ Verification email sent. Check your inbox.</div>}
              {resendStatus === 'error' && <div style={{ fontSize: '12px', color: '#C87878' }}>Failed to send. Try again.</div>}
            </div>
          )}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.link}>
          No account? <Link to="/register" style={styles.linkText}>Register</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--navy-1)',
    padding: '24px',
  },
  card: {
    background: 'var(--navy-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '48px',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '32px',
    fontWeight: '300',
    letterSpacing: '8px',
    color: 'var(--text-dark)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '10px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    textAlign: 'center',
    marginBottom: '40px',
  },
  group: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'var(--navy-2)',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '12px 14px',
    color: 'var(--text-dark)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    color: 'var(--burdened)',
    fontSize: '12px',
    marginBottom: '16px',
  },
  unverifiedBox: {
    background: 'rgba(142,196,224,0.06)',
    border: '1px solid rgba(142,196,224,0.2)',
    borderRadius: '3px',
    padding: '16px',
    marginBottom: '16px',
  },
  resendBtn: {
    background: 'none',
    border: '1px solid rgba(142,196,224,0.3)',
    borderRadius: '3px',
    padding: '8px 16px',
    color: '#8EC4E0',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  btn: {
    width: '100%',
    background: 'rgba(107,163,200,0.15)',
    border: '1px solid rgba(107,163,200,0.4)',
    borderRadius: '3px',
    padding: '14px',
    color: 'var(--steel-blue)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
  },
  link: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: 'var(--text-light)',
  },
  linkText: {
    color: 'var(--steel-blue)',
    textDecoration: 'none',
  },
};

export default Login;