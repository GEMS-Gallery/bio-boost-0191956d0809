import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataInput from './pages/DataInput';
import Trends from './pages/Trends';
import History from './pages/History';

function App() {
  return (
    <>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/input" element={<DataInput />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
