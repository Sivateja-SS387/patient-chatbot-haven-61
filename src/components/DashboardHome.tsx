
import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import VoiceAssistant from '@/components/VoiceAssistant';
import PatientInfo from '@/components/PatientInfo';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Volume2 } from 'lucide-react';

const DashboardHome = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className={cn(
            "w-full mb-4 p-1", 
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <TabsTrigger value="chat" className="flex-1 flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Chat Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex-1 flex items-center gap-2">
              <Volume2 size={16} />
              <span>Voice Assistant</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="m-0">
            <ChatInterface className="h-[calc(100vh-12rem)]" />
          </TabsContent>
          <TabsContent value="voice" className="m-0">
            <VoiceAssistant className="h-[calc(100vh-12rem)]" />
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <PatientInfo />
      </div>
    </div>
  );
};

export default DashboardHome;
