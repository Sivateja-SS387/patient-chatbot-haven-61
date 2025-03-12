
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
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Chat', icon: MessageSquare, path: '/dashboard/chat' },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Information', icon: Info, path: '/dashboard/information' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setExpanded(prev => !prev);
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
          <motion.button
            key={item.name}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200',
              isActive(item.path) 
                ? 'bg-spa-700 text-white' 
                : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
            )}
            onClick={() => navigate(item.path)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon size={20} />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <div className="mt-auto p-3">
        <motion.button
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors duration-200"
          onClick={() => navigate('/')}
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
