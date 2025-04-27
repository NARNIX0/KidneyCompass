import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import CalculatorPage from './pages/CalculatorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/history" 
              element={
                <PrivateRoute>
                  <HistoryPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="bg-gray-100 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Kidney Compass &copy; 2025</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App; 