
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import VoiceBot from '@/components/VoiceBot';
import PatientInfo from '@/components/PatientInfo';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    
    // Show welcome toast
    setTimeout(() => {
      toast({
        title: `${newGreeting}, ${user.name}!`,
        description: "Your medication and health information is ready for review.",
      });
    }, 1000);
  }, [toast, navigate]);

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
              <p className="text-gray-500">Here's your health dashboard overview</p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <ChatInterface className="h-[calc(100vh-12rem)]" />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-6">
                <PatientInfo />
                <VoiceBot />
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
