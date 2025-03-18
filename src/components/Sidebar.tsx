
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  User, 
  Settings, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Heart,
  FileText,
  CalendarClock,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard', description: 'View your health overview' },
    { name: 'Chat Assistant', icon: MessageSquare, path: '/dashboard/chat', description: 'Interact with your health assistant' },
    { name: 'Voice Assistant', icon: Volume2, path: '/dashboard/voice', description: 'Speak with your health assistant' },
    { name: 'My Profile', icon: User, path: '/dashboard/profile', description: 'Manage your profile information' },
    { name: 'Appointments', icon: CalendarClock, path: '/dashboard/appointments', description: 'Schedule and view appointments' },
    { name: 'Medications', icon: Heart, path: '/dashboard/medications', description: 'Manage your medications' },
    { name: 'Medical Records', icon: FileText, path: '/dashboard/records', description: 'Access your medical records' },
    { name: 'About', icon: Info, path: '/dashboard/information', description: 'Learn about our services' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', description: 'Configure your preferences' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  const toggleSidebar = () => {
    setExpanded(prev => !prev);
  };

  const handleNavigation = (path: string, name: string) => {
    navigate(path);
    toast({
      title: `Navigated to ${name}`,
      description: "You have successfully navigated to a new section",
    });
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden',
        expanded ? 'w-64' : 'w-20',
        className
      )}
      animate={{ width: expanded ? '16rem' : '5rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between p-4">
        <motion.div
          className="flex items-center gap-2"
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
        >
          {expanded && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="h-8 w-8 rounded-full bg-spa-500 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-lg font-semibold">SPA</span>
            </motion.div>
          )}
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-sidebar-accent/50 transition-colors duration-200"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-2 flex-1 px-3">
        {navItems.map((item) => (
          expanded ? (
            <motion.button
              key={item.name}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200',
                isActive(item.path) 
                  ? 'bg-spa-700 text-white' 
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
              onClick={() => handleNavigation(item.path, item.name)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={20} />
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          ) : (
            <TooltipProvider key={item.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    className={cn(
                      'flex items-center justify-center p-3 rounded-lg transition-colors duration-200 w-full',
                      isActive(item.path) 
                        ? 'bg-spa-700 text-white' 
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
                    )}
                    onClick={() => handleNavigation(item.path, item.name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon size={20} />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        ))}
      </div>

      <div className="mt-auto p-3">
        <motion.button
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors duration-200"
          onClick={() => {
            localStorage.removeItem('user');
            navigate('/');
            toast({
              title: "Logged out successfully",
              description: "Thank you for using Sails Patient Assistant",
            });
          }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={20} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
