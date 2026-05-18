import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function Register(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/register`, { email, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy before continuing with Google');
      return;
    }
    window.location.href = `${API}/auth/google`;
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>AXIS</div>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0', marginBottom: '16px' }}>Check your email</div>
            <div style={{ fontSize: '13px', color: '#8BAFC8', lineHeight: 1.7, marginBottom: '24px' }}>
              We sent a verification link to <strong style={{ color: '#D8E6F0' }}>{email}</strong>.<br />
              Click the link to activate your account.
            </div>
            <div style={{ fontSize: '11px', color: '#5A7A94', lineHeight: 1.6 }}>
              Didn't receive it? Check your spam folder or{' '}
              <Link to="/login" style={{ color: '#8EC4E0', textDecoration: 'none' }}>go to login</Link>{' '}
              to resend it.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>AXIS</div>
        <div style={styles.subtitle}>Create your account</div>

        <button style={styles.googleBtn} onClick={handleGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '10px', flexShrink: 0 }}>
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.53A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.53V5.4H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.51.85 3.6l2.68-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9c0-.01 0-.01 0 0l2.68 2.07C4.14 5.58 5.9 4.18 8.98 4.18z"/>
          </svg>
          Continue with Google
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

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
          <div style={styles.group}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div style={styles.agreeRow}>
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="agree" style={styles.agreeLabel}>
              I agree to the{' '}
              <a href="https://introspection.life/terms" target="_blank" rel="noopener noreferrer" style={styles.linkText}>Terms of Service</a>
              {' '}and{' '}
              <a href="https://introspection.life/privacy" target="_blank" rel="noopener noreferrer" style={styles.linkText}>Privacy Policy</a>
            </label>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkText}>Sign In</Link>
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
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '3px',
    padding: '12px 16px',
    color: '#3c4043',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(142,196,224,0.15)',
  },
  dividerText: {
    fontSize: '11px',
    color: '#5A7A94',
    letterSpacing: '2px',
    textTransform: 'uppercase',
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
  agreeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '20px',
    marginTop: '4px',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
    accentColor: '#8EC4E0',
  },
  agreeLabel: {
    fontSize: '12px',
    color: '#8BAFC8',
    lineHeight: 1.5,
    cursor: 'pointer',
  },
  error: {
    color: 'var(--burdened)',
    fontSize: '12px',
    marginBottom: '16px',
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

export default Register;