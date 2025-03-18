
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type VoiceAssistantProps = {
  className?: string;
};

const VoiceAssistant = ({ className }: VoiceAssistantProps) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Sails Voice Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const demoQueries = [
    "What medications do I need to take today?",
    "When is my next appointment?",
    "What are the side effects of Lisinopril?",
    "Remind me of my doctor's instructions"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate voice processing after a delay
      setTimeout(() => {
        setIsProcessing(false);
        const userQuery = "What are the side effects of Lisinopril?";
        
        // Add user message
        const newUserMessage: Message = {
          id: `user-${Date.now()}`,
          text: userQuery,
          sender: 'user',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, newUserMessage]);
        
        // Simulate bot response after a delay
        setTimeout(() => {
          const botResponse: Message = {
            id: `bot-${Date.now()}`,
            text: "Common side effects of Lisinopril may include dizziness, headache, fatigue, and dry cough. Serious side effects can include swelling of face/lips/tongue, difficulty breathing, or irregular heartbeat. Contact your doctor if you experience any severe symptoms.",
            sender: 'bot',
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, botResponse]);
        }, 1500);
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      setTranscript('');
    }
  };

  const selectDemoQuery = (query: string) => {
    // Simulate voice input with selected query
    setIsRecording(false);
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      // Add user message
      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        text: query,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newUserMessage]);
      
      // Simulate bot response after a delay
      setTimeout(() => {
        let botResponse = "I don't have specific information about that. Would you like me to find out more?";
        
        if (query.includes("Lisinopril")) {
          botResponse = "Common side effects of Lisinopril may include dizziness, headache, fatigue, and dry cough. Serious side effects can include swelling of face/lips/tongue, difficulty breathing, or irregular heartbeat. Contact your doctor if you experience any severe symptoms.";
        } else if (query.includes("appointment")) {
          botResponse = "Your next appointment is scheduled for June 15th at 10:30 AM with Dr. Johnson.";
        } else if (query.includes("medications")) {
          botResponse = "Today you need to take Lisinopril (10mg) in the morning, Metformin (500mg) with breakfast and dinner, and Aspirin (81mg) once daily.";
        } else if (query.includes("doctor")) {
          botResponse = "Your doctor advised to take all medications with food, increase water intake, and monitor your blood pressure daily. Report any readings above 140/90.";
        }
        
        const newBotMessage: Message = {
          id: `bot-${Date.now()}`,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, newBotMessage]);
      }, 1500);
    }, 1000);
  };

  return (
    <div className={cn('flex flex-col h-full rounded-lg overflow-hidden', isDarkMode ? 'bg-gray-800' : 'bg-white', className)}>
      <div className={cn("p-4 border-b flex items-center justify-between", isDarkMode ? "bg-gray-700 border-gray-600" : "bg-spa-50 border-gray-200")}>
        <div className="flex items-center gap-2">
          <Volume2 size={20} className={isDarkMode ? "text-spa-300" : "text-spa-600"} />
          <h2 className={isDarkMode ? "font-semibold text-white" : "font-semibold text-spa-900"}>Sails Voice Assistant</h2>
        </div>
        <span className={cn(
          "px-2 py-1 text-xs rounded-full",
          isDarkMode 
            ? "bg-green-900 text-green-100" 
            : "bg-green-100 text-green-800"
        )}>
          Active
        </span>
      </div>

      <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", isDarkMode ? "bg-gray-800" : "")}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex gap-3 max-w-[80%]',
                message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div 
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.sender === 'user' 
                    ? isDarkMode ? 'bg-spa-700 text-white' : 'bg-spa-100 text-spa-700' 
                    : isDarkMode ? 'bg-spa-500 text-white' : 'bg-spa-600 text-white'
                )}
              >
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={cn(
                  'p-3 rounded-lg',
                  message.sender === 'user'
                    ? isDarkMode ? 'bg-spa-600 text-white' : 'bg-spa-500 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                )}
              >
                <p className="text-sm">{message.text}</p>
                <span className={cn("text-xs mt-1 block", 
                  message.sender === 'user'
                    ? 'opacity-80' 
                    : isDarkMode ? 'text-gray-300 opacity-80' : 'opacity-70'
                )}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", 
                isDarkMode ? "bg-spa-500 text-white" : "bg-spa-600 text-white"
              )}>
                <Bot size={16} />
              </div>
              <div className={cn("p-3 rounded-lg", 
                isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800"
              )}>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className={cn("p-3", isDarkMode ? "bg-gray-700" : "bg-gray-50")}>
        <div className="mb-2">
          <p className={cn("text-xs mb-2", isDarkMode ? "text-gray-300" : "text-gray-500")}>Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {demoQueries.map((query, index) => (
              <button
                key={index}
                className={cn("px-3 py-1 rounded-full text-xs transition-colors", 
                  isDarkMode 
                    ? "bg-spa-700 text-spa-200 hover:bg-spa-600" 
                    : "bg-spa-100 text-spa-700 hover:bg-spa-200"
                )}
                onClick={() => selectDemoQuery(query)}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            onClick={handleVoiceInput}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              isRecording 
                ? isDarkMode ? "bg-red-600 animate-pulse" : "bg-red-500 animate-pulse"
                : isDarkMode ? "bg-spa-600 hover:bg-spa-500" : "bg-spa-500 hover:bg-spa-600", 
              "text-white"
            )}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {isRecording && (
          <div className="mt-4 text-center">
            <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-600")}>
              Listening... {transcript || "Speak now"}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-5 rounded-full", 
                    isDarkMode ? "bg-spa-400" : "bg-spa-500"
                  )}
                  style={{ 
                    animation: `pulse 1s infinite ${i * 0.15}s`,
                    height: `${Math.random() * 20 + 5}px`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
