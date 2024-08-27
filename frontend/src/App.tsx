import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataInput from './pages/DataInput';
import Trends from './pages/Trends';
import History from './pages/History';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/input" element={<PrivateRoute><DataInput /></PrivateRoute>} />
          <Route path="/trends" element={<PrivateRoute><Trends /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
