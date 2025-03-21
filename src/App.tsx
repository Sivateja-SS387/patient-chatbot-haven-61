
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Toaster } from './components/ui/toaster';
import UserDetailsForm from './components/UserDetailsForm';

function App() {
  return (
    <ThemeProvider>
      <NotificationsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/user-details" element={<UserDetailsForm />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
