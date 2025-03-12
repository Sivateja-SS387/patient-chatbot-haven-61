
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import VoiceBot from '@/components/VoiceBot';
import PatientInfo from '@/components/PatientInfo';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Create components for each dashboard section
const DashboardHome = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChatInterface className="h-[calc(100vh-12rem)]" />
      </div>
      <div className="space-y-6">
        <PatientInfo />
        <VoiceBot />
      </div>
    </div>
  );
};

const ProfilePage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Full Name</span>
        <span className="font-medium">Nilima</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Email</span>
        <span className="font-medium">nilima.v9@gmail.com</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Date of Birth</span>
        <span className="font-medium">09 January 1993</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Phone</span>
        <span className="font-medium">+1 (555) 123-4567</span>
      </div>
    </div>
  </div>
);

const ChatPage = () => (
  <div className="h-[calc(100vh-12rem)]">
    <ChatInterface className="h-full" />
  </div>
);

const AppointmentsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
    <p>You have no upcoming appointments scheduled.</p>
  </div>
);

const MedicationsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">My Medications</h2>
    <div className="space-y-4">
      {['Lisinopril', 'Metformin', 'Aspirin'].map((med, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <h3 className="font-medium">{med}</h3>
        </div>
      ))}
    </div>
  </div>
);

const RecordsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">Medical Records</h2>
    <p>Your medical records will be displayed here.</p>
  </div>
);

const InformationPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">About Sails Patient Assistant</h2>
    <p className="mb-4">Sails Patient Assistant is a comprehensive health management platform designed to help patients manage their healthcare needs efficiently.</p>
    <p>For more information, please contact support.</p>
  </div>
);

const SettingsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4">Settings</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <span>Dark Mode</span>
        <button className="px-3 py-1 bg-gray-200 rounded-md">Off</button>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <span>Notifications</span>
        <button className="px-3 py-1 bg-gray-200 rounded-md">On</button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get the time-appropriate greeting
    const hour = new Date().getHours();
    let newGreeting = 'Good evening';
    
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    }
    
    setGreeting(newGreeting);
    
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(userData);
    setUserName(user.name || 'User');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "Thank you for using Sails Patient Assistant",
    });
    navigate('/');
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Function to get the current section title
  const getCurrentSectionTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/chat') return 'Chat Assistant';
    if (path === '/dashboard/profile') return 'My Profile';
    if (path === '/dashboard/appointments') return 'Appointments';
    if (path === '/dashboard/medications') return 'Medications';
    if (path === '/dashboard/records') return 'Medical Records';
    if (path === '/dashboard/information') return 'About';
    if (path === '/dashboard/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 border-gray-200 border text-sm focus:ring-2 focus:ring-spa-500 focus:border-transparent w-64 transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-spa-500"></span>
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spa-100 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-spa-600" />
              </div>
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">{greeting}, {userName}</h1>
              <p className="text-gray-500">{getCurrentSectionTitle()}</p>
            </motion.div>
            
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/information" element={<InformationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
