import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/login';
import Register from './screens/register';
import Home from './screens/home';
import Scan from './screens/scan';
import CPM from './screens/cpm';
import CBM from './screens/cbm';
import Progress from './screens/progress';
import Journal from './screens/journal';
import Tutorial from './screens/tutorial';

function App() {
  const [token, setToken] = useState(localStorage.getItem('axis_token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('axis_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('axis_token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
        <Route path="/" element={token ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/scan" element={token ? <Scan /> : <Navigate to="/login" />} />
        <Route path="/cpm" element={token ? <CPM /> : <Navigate to="/login" />} />
        <Route path="/cbm" element={token ? <CBM /> : <Navigate to="/login" />} />
        <Route path="/progress" element={token ? <Progress /> : <Navigate to="/login" />} />
        <Route path="/journal" element={token ? <Journal /> : <Navigate to="/login" />} />
        <Route path="/tutorial" element={token ? <Tutorial /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;