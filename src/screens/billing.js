import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('axis_token');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (location.pathname === '/billing/success') setBanner({ kind: 'success', text: 'Subscription activated. Welcome!' });
    if (location.pathname === '/billing/cancel') setBanner({ kind: 'cancel', text: 'Checkout canceled.' });
    loadStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStatus = async () => {
    try {
      const res = await axios.get(API + '/api/stripe/status', { headers: { Authorization: 'Bearer ' + token } });
      setStatus(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (tier) => {
    setSubmitting(tier);
    try {
      const res = await axios.post(API + '/api/stripe/checkout', { tier }, { headers: { Authorization: 'Bearer ' + token } });
      window.location.href = res.data.url;
    } catch (e) {
      alert(e.response?.data?.message || 'Could not start checkout');
      setSubmitting(null);
    }
  };

  const openPortal = async () => {
    setSubmitting('portal');
    try {
      const res = await axios.post(API + '/api/stripe/portal', {}, { headers: { Authorization: 'Bearer ' + token } });
      window.location.href = res.data.url;
    } catch (e) {
      alert(e.response?.data?.error || 'Could not open billing portal');
      setSubmitting(null);
    }
  };

  if (loading) return <div style={styles.container}><div style={{ color: '#8BAFC8' }}>Loading...</div></div>;

  const hasActive = status && (status.subscription_status === 'active' || status.subscription_status === 'trialing');
  const currentTier = status?.tier || 'regular';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <span style={styles.toolbarTitle}>Billing</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 32px', width: '100%' }}>
        {banner && (
          <div style={{ ...styles.banner, ...(banner.kind === 'success' ? styles.bannerSuccess : styles.bannerCancel) }}>
            {banner.text}
          </div>
        )}

        <div style={styles.statusCard}>
          <div style={styles.statusLabel}>CURRENT PLAN</div>
          <div style={styles.statusTier}>{currentTier === 'pro' ? 'AXIS — Pro' : 'AXIS — Regular'}</div>
          <div style={styles.statusMeta}>
            {hasActive ? (
              <>
                {status.subscription_status === 'trialing' ? 'Free trial' : 'Active'}
                {status.subscription_current_period_end && (
                  <> · Renews {new Date(status.subscription_current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                )}
              </>
            ) : (
              'No active subscription'
            )}
          </div>
          {hasActive && (
            <button style={{ ...styles.btn, marginTop: '20px' }} onClick={openPortal} disabled={submitting === 'portal'}>
              {submitting === 'portal' ? 'Opening...' : 'Manage Subscription'}
            </button>
          )}
        </div>

        <div style={styles.plansGrid}>
          <div style={styles.planCard}>
            <div style={styles.planName}>AXIS — Regular</div>
            <div style={styles.planPrice}>$5<span style={styles.planInterval}>/month</span></div>
            <div style={styles.planTrial}>2-day free trial</div>
            <ul style={styles.planList}>
              <li>One profile</li>
              <li>Daily Scan</li>
              <li>Complex Map</li>
              <li>Behavior Map</li>
              <li>Relational Map</li>
              <li>View Progress</li>
              <li>Dream Journal</li>
            </ul>
            {!hasActive ? (
              <button style={styles.planBtn} onClick={() => startCheckout('regular')} disabled={submitting === 'regular'}>
                {submitting === 'regular' ? 'Loading...' : 'Start Free Trial'}
              </button>
            ) : currentTier === 'regular' ? (
              <div style={styles.planCurrent}>Current Plan</div>
            ) : (
              <button style={styles.planBtn} onClick={openPortal} disabled={submitting === 'portal'}>
                Switch to Regular
              </button>
            )}
          </div>

          <div style={{ ...styles.planCard, ...styles.planCardPro }}>
            <div style={styles.planBadge}>PRO</div>
            <div style={styles.planName}>AXIS — Pro</div>
            <div style={styles.planPrice}>$9<span style={styles.planInterval}>/month</span></div>
            <div style={styles.planTrial}>2-day free trial</div>
            <ul style={styles.planList}>
              <li><strong>Unlimited profiles</strong></li>
              <li><strong>PDF export</strong></li>
              <li>Daily Scan</li>
              <li>Complex Map</li>
              <li>Behavior Map</li>
              <li>Relational Map</li>
              <li>View Progress</li>
              <li>Dream Journal</li>
            </ul>
            {!hasActive ? (
              <button style={{ ...styles.planBtn, ...styles.planBtnPro }} onClick={() => startCheckout('pro')} disabled={submitting === 'pro'}>
                {submitting === 'pro' ? 'Loading...' : 'Start Free Trial'}
              </button>
            ) : currentTier === 'pro' ? (
              <div style={styles.planCurrent}>Current Plan</div>
            ) : (
              <button style={{ ...styles.planBtn, ...styles.planBtnPro }} onClick={openPortal} disabled={submitting === 'portal'}>
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0d1b2a', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderBottom: '1px solid rgba(142,196,224,0.15)', background: '#0f2236' },
  backBtn: { background: 'none', border: 'none', color: '#8BAFC8', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', cursor: 'pointer', padding: 0 },
  toolbarTitle: { fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', color: '#8BAFC8', flex: 1, textAlign: 'center' },
  banner: { padding: '14px 18px', borderRadius: '3px', marginBottom: '24px', fontSize: '13px' },
  bannerSuccess: { background: 'rgba(74,174,136,0.1)', border: '1px solid rgba(74,174,136,0.4)', color: '#4AAE88' },
  bannerCancel: { background: 'rgba(200,168,80,0.1)', border: '1px solid rgba(200,168,80,0.4)', color: '#C8A840' },
  statusCard: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '4px', padding: '28px', marginBottom: '32px' },
  statusLabel: { fontSize: '9px', fontWeight: '700', letterSpacing: '3px', color: '#8BAFC8', marginBottom: '10px' },
  statusTier: { fontFamily: 'Georgia, serif', fontSize: '24px', color: '#D8E6F0', marginBottom: '6px' },
  statusMeta: { fontSize: '12px', color: '#8BAFC8' },
  btn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '8px 16px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  plansGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  planCard: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '4px', padding: '28px', position: 'relative' },
  planCardPro: { border: '1px solid rgba(155,126,200,0.4)' },
  planBadge: { position: 'absolute', top: '14px', right: '14px', fontSize: '8px', fontWeight: '700', letterSpacing: '2px', color: '#9B7EC8', padding: '3px 8px', border: '1px solid rgba(155,126,200,0.4)', borderRadius: '2px' },
  planName: { fontFamily: 'Georgia, serif', fontSize: '20px', color: '#D8E6F0', marginBottom: '14px' },
  planPrice: { fontFamily: 'Georgia, serif', fontSize: '36px', color: '#D8E6F0', marginBottom: '4px' },
  planInterval: { fontSize: '14px', color: '#8BAFC8', marginLeft: '4px' },
  planTrial: { fontSize: '11px', color: '#4AAE88', marginBottom: '20px', letterSpacing: '1px' },
  planList: { listStyle: 'none', padding: 0, margin: '0 0 24px 0', color: '#A0C4D8', fontSize: '13px', lineHeight: 2 },
  planBtn: { width: '100%', background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  planBtnPro: { background: 'rgba(155,126,200,0.15)', border: '1px solid rgba(155,126,200,0.4)', color: '#9B7EC8' },
  planCurrent: { width: '100%', padding: '10px', textAlign: 'center', color: '#4AAE88', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px' },
};

export default Billing;