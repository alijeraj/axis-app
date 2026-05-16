import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function AccessGate({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('axis_token');
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(API + '/api/stripe/status', { headers: { Authorization: 'Bearer ' + token } });
        setHasAccess(res.data.has_access);
      } catch (e) {
        console.log(e);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [token, location.pathname]);

  const isBillingPath = location.pathname.startsWith('/billing');

  if (checking) return null;

  if (!hasAccess && !isBillingPath) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>AX<span style={styles.logoSpan}>IS</span></div>
          <div style={styles.title}>Choose your plan</div>
          <div style={styles.text}>
            Start your 2-day free trial. Pick a plan and add your card to begin navigating your inner world. You won't be charged until day 3.
          </div>
          <button style={styles.btn} onClick={() => navigate('/billing')}>View Plans</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0d1b2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    background: '#162534',
    border: '1px solid rgba(142,196,224,0.25)',
    borderRadius: '4px',
    padding: '48px',
    maxWidth: '480px',
    textAlign: 'center',
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '48px',
    fontWeight: '300',
    color: '#D8E6F0',
    letterSpacing: '-2px',
    marginBottom: '24px',
  },
  logoSpan: { color: '#8EC4E0', fontWeight: '600' },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    color: '#D8E6F0',
    marginBottom: '14px',
  },
  text: {
    fontSize: '14px',
    color: '#A0C4D8',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  btn: {
    background: 'rgba(142,196,224,0.15)',
    border: '1px solid rgba(142,196,224,0.4)',
    borderRadius: '3px',
    padding: '12px 28px',
    color: '#8EC4E0',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
};

export default AccessGate;