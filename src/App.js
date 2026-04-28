import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './screens/landing';
import Login from './screens/login';
import Register from './screens/register';
import Home from './screens/home';
import Scan from './screens/scan';
import CPM from './screens/cpm';
import CBM from './screens/cbm';
import Progress from './screens/progress';
import Results from './screens/results';
import Journal from './screens/journal';
import Tutorial from './screens/tutorial';
import Yesterday from './screens/yesterday';
import SelfPortrait from './screens/selfportrait';
import { useEffect } from 'react';

function GoogleCallback({ onLogin }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) onLogin(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div style={{ background: '#0d1b2a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8BAFC8', fontFamily: 'Georgia, serif', fontSize: '18px' }}>Signing in...</div>;
}

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo'); // logo → tagline1 → tagline2 → hold → fadeout
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in logo
    const t1 = setTimeout(() => setOpacity(1), 50);
    // Show tagline 1
    const t2 = setTimeout(() => setPhase('tagline1'), 1200);
    // Show tagline 2
    const t3 = setTimeout(() => setPhase('tagline2'), 2000);
    // Start fade out
    const t4 = setTimeout(() => { setPhase('fadeout'); setOpacity(0); }, 5200);
    // Done
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
        {/* Logo */}
        <div style={{ opacity: phase !== 'fadeout' ? 1 : 0, transition: 'opacity 0.8s ease' }}>
          <img src="/introspection-logo.png" alt="Introspection" style={{ height: '200px', display: 'block' }} />
        </div>

        {/* Divider */}
        <div style={{ width: '40px', height: '1px', background: '#c0c8d0', opacity: phase === 'tagline1' || phase === 'tagline2' || phase === 'hold' ? 1 : 0, transition: 'opacity 0.6s ease' }} />

        {/* Tagline 1 */}
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', letterSpacing: '3px',
          color: '#4a5568', opacity: phase === 'tagline1' || phase === 'tagline2' || phase === 'hold' ? 1 : 0,
          transition: 'opacity 0.6s ease', textAlign: 'center',
        }}>
          The art of inner mapping
        </div>

        {/* Tagline 2 */}
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('axis_token'));
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (newToken) => {
    localStorage.setItem('axis_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('axis_token');
    setToken(null);
  };

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Home onLogout={handleLogout} /> : <Landing />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
        <Route path="/scan" element={token ? <Scan /> : <Navigate to="/login" />} />
        <Route path="/cpm" element={token ? <CPM /> : <Navigate to="/login" />} />
        <Route path="/cbm" element={token ? <CBM /> : <Navigate to="/login" />} />
        <Route path="/progress" element={token ? <Progress /> : <Navigate to="/login" />} />
        <Route path="/results" element={token ? <Results /> : <Navigate to="/login" />} />
        <Route path="/journal" element={token ? <Journal /> : <Navigate to="/login" />} />
        <Route path="/tutorial" element={token ? <Tutorial /> : <Navigate to="/login" />} />
        <Route path="/yesterday" element={token ? <Yesterday /> : <Navigate to="/login" />} />
        <Route path="/selfportrait" element={token ? <SelfPortrait /> : <Navigate to="/login" />} />
        <Route path="/auth/callback" element={<GoogleCallback onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;