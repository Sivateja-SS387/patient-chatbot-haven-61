import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import PatientInfo from '@/components/PatientInfo';
import DashboardHome from '@/components/DashboardHome';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Toggle } from '@/components/ui/toggle';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import MedicationDetails from '@/components/MedicationDetails';
import VoiceAssistant from '@/components/VoiceAssistant';
import EditableProfile from '@/components/EditableProfile';

const SimpleDashboardView = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChatInterface className="h-[calc(100vh-12rem)]" />
      </div>
      <div className="space-y-6">
        <PatientInfo />
      </div>
    </div>
  );
};

const ChatPage = () => (
  <div className="h-[calc(100vh-12rem)]">
    <ChatInterface className="h-full" />
  </div>
);

const VoiceAssistantPage = () => (
  <div className="h-[calc(100vh-12rem)]">
    <VoiceAssistant className="h-full" />
  </div>
);

const AppointmentsPage = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4 dark:text-white">My Appointments</h2>
    <p className="dark:text-gray-300">You have no upcoming appointments scheduled.</p>
  </div>
);

const MedicationsPage = () => {
  const { isDarkMode } = useTheme();
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in the morning',
      purpose: 'Treats high blood pressure and heart failure',
      sideEffects: ['Dizziness', 'Headache', 'Dry cough', 'Fatigue'],
      instructions: 'Take with or without food at the same time each day',
      nextRefill: 'June 25, 2023'
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      purpose: 'Controls blood sugar levels for type 2 diabetes',
      sideEffects: ['Nausea', 'Stomach upset', 'Diarrhea', 'Metallic taste'],
      instructions: 'Take with food to reduce stomach upset',
      nextRefill: 'July 10, 2023'
    },
    {
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      purpose: 'Prevents blood clots and reduces heart attack risk',
      sideEffects: ['Stomach irritation', 'Nausea', 'Heartburn', 'Easy bruising'],
      instructions: 'Take with food to minimize stomach irritation',
      nextRefill: 'August 5, 2023'
    }
  ];

  const handleMedicationClick = (medication: any) => {
    setSelectedMedication(medication);
    setDetailsOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">My Medications</h2>
      <div className="space-y-4">
        {medications.map((med, index) => (
          <div 
            key={index} 
            className={cn(
              "p-4 border rounded-lg cursor-pointer transition-colors",
              isDarkMode 
                ? "dark:border-gray-700 dark:text-white hover:bg-gray-700" 
                : "hover:bg-gray-50"
            )}
            onClick={() => handleMedicationClick(med)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{med.name}</h3>
                <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  {med.dosage} - {med.frequency}
                </p>
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
              )}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedMedication && (
        <MedicationDetails 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen} 
          medication={selectedMedication} 
        />
      )}
    </div>
  );
};

const RecordsPage = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4 dark:text-white">Medical Records</h2>
    <p className="dark:text-gray-300">Your medical records will be displayed here.</p>
  </div>
);

const InformationPage = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h2 className="text-2xl font-semibold mb-4 dark:text-white">About Sails Patient Assistant</h2>
    <p className="mb-4 dark:text-gray-300">Sails Patient Assistant is a comprehensive health management platform designed to help patients manage their healthcare needs efficiently.</p>
    <p className="dark:text-gray-300">For more information, please contact support.</p>
  </div>
);

const SettingsPage = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
          <span className="dark:text-white">Dark Mode</span>
          <Switch 
            checked={isDarkMode} 
            onCheckedChange={toggleDarkMode}
            aria-label="Toggle dark mode"
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
          <span className="dark:text-white">Notifications</span>
          <Switch 
            checked={notificationsEnabled} 
            onCheckedChange={toggleNotifications}
            aria-label="Toggle notifications"
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { notificationsEnabled } = useNotifications();
  
  const notifications = [
    { id: 1, title: "Appointment Reminder", message: "You have a doctor's appointment tomorrow at 10:00 AM", time: "1 hour ago" },
    { id: 2, title: "Medication Alert", message: "Time to take your evening medication", time: "3 hours ago" },
    { id: 3, title: "Lab Results", message: "Your recent lab results are now available", time: "Yesterday" },
  ];
  
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = 'Good evening';
    
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    }
    
    setGreeting(newGreeting);
    
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
  
  const handleNotificationClick = (id: number) => {
    toast({
      title: "Notification viewed",
      description: "You've opened notification #" + id,
    });
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

  const getCurrentSectionTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/chat') return 'Chat Assistant';
    if (path === '/dashboard/voice') return 'Voice Assistant';
    if (path === '/dashboard/profile') return 'My Profile';
    if (path === '/dashboard/appointments') return 'Appointments';
    if (path === '/dashboard/medications') return 'Medications';
    if (path === '/dashboard/records') return 'Medical Records';
    if (path === '/dashboard/information') return 'About';
    if (path === '/dashboard/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className={cn("h-screen flex overflow-hidden", isDarkMode ? "dark" : "")}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 border text-sm focus:ring-2 focus:ring-spa-500 focus:border-transparent w-64 transition-all duration-200 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Toggle 
              aria-label="Toggle dark mode"
              pressed={isDarkMode}
              onPressedChange={toggleDarkMode}
              className={cn(
                "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700",
                isDarkMode ? "bg-gray-800 text-yellow-300" : "bg-white text-gray-600"
              )}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Toggle>
            
            {notificationsEnabled && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative" aria-label="Notifications">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-spa-500"></span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 dark:bg-gray-800 dark:border-gray-700" align="end">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-medium dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-auto divide-y dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm dark:text-white">{notification.title}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No new notifications
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spa-100 dark:bg-spa-800 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-spa-600 dark:text-spa-200" />
              </div>
              <span className="text-sm font-medium dark:text-white">{userName}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-500 text-gray-600 dark:text-gray-300 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{greeting}, {userName}</h1>
              <p className="text-gray-500 dark:text-gray-400">{getCurrentSectionTitle()}</p>
            </motion.div>
            
            <Routes>
              <Route path="/" element={<SimpleDashboardView />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/voice" element={<VoiceAssistantPage />} />
              <Route path="/profile" element={<EditableProfile />} />
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
