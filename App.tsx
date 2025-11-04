import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectionPage from './pages/ProjectionPage';
import ParticleBackground from './components/ParticleBackground';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen relative">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projection/:id" element={<ProjectionPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;