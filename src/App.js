import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './screens/landing';
import Login from './screens/login';
import Register from './screens/register';
import Home from './screens/home';
import Scan from './screens/scan';
import CPM from './screens/cpm';
import CBM from './screens/cbm';
import CBMResults from './screens/cbmresults';
import Progress from './screens/progress';
import Results from './screens/results';
import Journal from './screens/journal';
import Tutorial from './screens/tutorial';
import People from './screens/people';
import Patterns from './screens/patterns';
import Billing from './screens/billing';
import AccessGate from './components/AccessGate';

axios.interceptors.request.use((config) => {
  const profileId = localStorage.getItem('axis_profile_id');
  if (profileId) {
    config.headers['x-profile-id'] = profileId;
  }
  return config;
});

function GoogleCallback({ onLogin }) {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      onLogin(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div style={{ background: '#0d1b2a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8BAFC8', fontFamily: 'Georgia, serif', fontSize: '18px' }}>Signing in...</div>;
}

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo');
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setOpacity(1), 50);
    const t2 = setTimeout(() => setPhase('tagline1'), 1200);
    const t3 = setTimeout(() => setPhase('tagline2'), 2000);
    const t4 = setTimeout(() => { setPhase('fadeout'); setOpacity(0); }, 5200);
    const t5 = setTimeout(() => onDone(), 6000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#ffffff', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      opacity, transition: phase === 'fadeout' ? 'opacity 0.8s ease' : 'opacity 0.8s ease',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <div style={{ opacity: phase !== 'fadeout' ? 1 : 0, transition: 'opacity 0.8s ease' }}>
          <img src="/introspection-logo.png" alt="Introspection" style={{ height: '200px', display: 'block' }} />
        </div>
        <div style={{ width: '40px', height: '1px', background: '#c0c8d0', opacity: phase === 'tagline1' || phase === 'tagline2' || phase === 'hold' ? 1 : 0, transition: 'opacity 0.6s ease' }} />
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', letterSpacing: '3px',
          color: '#4a5568', opacity: phase === 'tagline1' || phase === 'tagline2' || phase === 'hold' ? 1 : 0,
          transition: 'opacity 0.6s ease', textAlign: 'center',
        }}>
          The art of inner mapping
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', letterSpacing: '1px',
          color: '#1a202c', opacity: phase === 'tagline2' || phase === 'hold' ? 1 : 0,
          transition: 'opacity 0.6s ease', textAlign: 'center',
        }}>
          Navigate your inner world.
        </div>
      </div>
    </div>
  );
}

function Protected({ token, children }) {
  if (!token) return <Navigate to="/login" />;
  return <AccessGate>{children}</AccessGate>;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('axis_token'));
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (newToken) => {
    localStorage.setItem('axis_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('axis_token');
    localStorage.removeItem('axis_profile_id');
    setToken(null);
  };

  const isAuthCallback = window.location.pathname === '/auth/callback';
  if (showSplash && !isAuthCallback) return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Protected token={token}><Home onLogout={handleLogout} /></Protected> : <Landing />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
        <Route path="/scan" element={<Protected token={token}><Scan /></Protected>} />
        <Route path="/cpm" element={<Protected token={token}><CPM /></Protected>} />
        <Route path="/cbm" element={<Protected token={token}><CBM /></Protected>} />
        <Route path="/cbmresults" element={<Protected token={token}><CBMResults /></Protected>} />
        <Route path="/progress" element={<Protected token={token}><Progress /></Protected>} />
        <Route path="/results" element={<Protected token={token}><Results /></Protected>} />
        <Route path="/journal" element={<Protected token={token}><Journal /></Protected>} />
        <Route path="/tutorial" element={<Protected token={token}><Tutorial /></Protected>} />
        <Route path="/people" element={<Protected token={token}><People /></Protected>} />
        <Route path="/patterns" element={<Protected token={token}><Patterns /></Protected>} />
        <Route path="/billing" element={token ? <Billing /> : <Navigate to="/login" />} />
        <Route path="/billing/success" element={token ? <Billing /> : <Navigate to="/login" />} />
        <Route path="/billing/cancel" element={token ? <Billing /> : <Navigate to="/login" />} />
        <Route path="/auth/callback" element={<GoogleCallback onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;