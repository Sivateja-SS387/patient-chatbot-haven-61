import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Bot, User, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Sails Voice Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [restartAttempts, setRestartAttempts] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const abortErrorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(Date.now());

  const demoQueries = [
    "What medications do I need to take today?",
    "When is my next appointment?",
    "What are the side effects of Lisinopril?",
    "Remind me of my doctor's instructions"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      initializeSpeechRecognition();
      
      if (isSpeechEnabled) {
        const initialDelay = window.setTimeout(() => {
          startSpeechRecognition();
        }, 1000);
        
        return () => {
          window.clearTimeout(initialDelay);
        };
      }
    } else {
      setIsSpeechEnabled(false);
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome.",
        variant: "destructive"
      });
    }
    
    return () => {
      cleanupSpeechRecognition();
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      setIsSpeechEnabled(false);
      return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setIsRecognitionActive(true);
      abortErrorCountRef.current = 0;
    };
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptValue = result[0].transcript;
      
      setTranscript(transcriptValue);
      
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      if (result.isFinal) {
        silenceTimeoutRef.current = window.setTimeout(() => {
          if (transcriptValue.trim().length > 0) {
            processVoiceInput(transcriptValue);
          }
        }, 1500);
      }
    };
    
    recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error', event.error);
      const now = Date.now();
      
      if (event.error === 'aborted') {
        if (now - lastErrorTimeRef.current < 1000) {
          abortErrorCountRef.current++;
        } else {
          abortErrorCountRef.current = 1;
        }
        lastErrorTimeRef.current = now;
        
        if (abortErrorCountRef.current > 3) {
          setIsListening(false);
          setIsRecognitionActive(false);
          setRestartAttempts(prev => prev + 1);
          
          if (restartAttempts > 5) {
            setIsSpeechEnabled(false);
            toast({
              title: "Speech Recognition Disabled",
              description: "Too many errors occurred. Speech recognition has been disabled. Click the microphone to try again.",
              variant: "destructive"
            });
          } else {
            scheduleDelayedRestart(2000);
          }
        } else {
          setIsRecognitionActive(false);
          scheduleDelayedRestart(500);
        }
      } else if (event.error === 'no-speech') {
        setIsRecognitionActive(false);
        if (isSpeechEnabled && !isProcessing) {
          scheduleDelayedRestart(1000);
        }
      } else {
        setIsListening(false);
        setIsRecognitionActive(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      }
    };
    
    recognitionRef.current.onend = () => {
      setIsRecognitionActive(false);
      
      if (isSpeechEnabled && !isProcessing && restartAttempts < 5) {
        scheduleDelayedRestart(1000);
      } else {
        setIsListening(false);
      }
    };
  };

  const scheduleDelayedRestart = (delay: number) => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = window.setTimeout(() => {
      if (isSpeechEnabled && !isRecognitionActive && !isProcessing) {
        startSpeechRecognition();
      }
      restartTimeoutRef.current = null;
    }, delay);
  };

  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        if (isRecognitionActive) {
          recognitionRef.current.abort();
        }
      } catch (error) {
        console.error('Error cleaning up speech recognition:', error);
      }
    }
    
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const startSpeechRecognition = () => {
    try {
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      if (recognitionRef.current && !isRecognitionActive && !isProcessing) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      
      abortErrorCountRef.current = 0;
      setRestartAttempts(prev => prev + 1);
      
      if (restartAttempts < 5) {
        setTimeout(() => {
          if (isSpeechEnabled) {
            initializeSpeechRecognition();
            startSpeechRecognition();
          }
        }, 2000);
      } else {
        setIsSpeechEnabled(false);
        toast({
          title: "Speech Recognition Disabled",
          description: "Too many errors occurred. Speech recognition has been disabled. Click the microphone to try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsSpeechEnabled(false);
      setRestartAttempts(0);
      if (recognitionRef.current && isRecognitionActive) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      setIsListening(false);
    } else {
      setIsSpeechEnabled(true);
      setRestartAttempts(0);
      startSpeechRecognition();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processVoiceInput = (inputText: string) => {
    setIsProcessing(true);
    setTranscript('');
    
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    
    setTimeout(() => {
      setIsProcessing(false);
      let botResponse = "I don't have specific information about that. Would you like me to find out more?";
      
      if (inputText.toLowerCase().includes("lisinopril")) {
        botResponse = "Common side effects of Lisinopril may include dizziness, headache, fatigue, and dry cough. Serious side effects can include swelling of face/lips/tongue, difficulty breathing, or irregular heartbeat. Contact your doctor if you experience any severe symptoms.";
      } else if (inputText.toLowerCase().includes("appointment")) {
        botResponse = "Your next appointment is scheduled for June 15th at 10:30 AM with Dr. Johnson.";
      } else if (inputText.toLowerCase().includes("medications")) {
        botResponse = "Today you need to take Lisinopril (10mg) in the morning, Metformin (500mg) with breakfast and dinner, and Aspirin (81mg) once daily.";
      } else if (inputText.toLowerCase().includes("doctor")) {
        botResponse = "Your doctor advised to take all medications with food, increase water intake, and monitor your blood pressure daily. Report any readings above 140/90.";
      }
      
      const newBotMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newBotMessage]);
      
      if (isSpeechEnabled) {
        scheduleDelayedRestart(800);
      }
    }, 1000);
  };

  const selectDemoQuery = (query: string) => {
    processVoiceInput(query);
  };

  return (
    <div className={cn('flex flex-col h-full rounded-lg overflow-hidden', isDarkMode ? 'bg-gray-800' : 'bg-white', className)}>
      <div className={cn("p-4 border-b flex items-center justify-between", isDarkMode ? "bg-gray-700 border-gray-600" : "bg-spa-50 border-gray-200")}>
        <div className="flex items-center gap-2">
          <Volume2 size={20} className={isDarkMode ? "text-spa-300" : "text-spa-600"} />
          <h2 className={isDarkMode ? "font-semibold text-white" : "font-semibold text-spa-900"}>Sails Voice Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            isListening 
              ? isDarkMode ? "bg-green-900 text-green-100" : "bg-green-100 text-green-800"
              : isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
          )}>
            {isListening ? "Listening" : "Not Listening"}
          </span>
          <button
            onClick={toggleSpeechRecognition}
            className={cn(
              "p-1 rounded-full",
              isListening 
                ? isDarkMode ? "bg-red-900 text-red-100" : "bg-red-100 text-red-600"
                : isDarkMode ? "bg-green-900 text-green-100" : "bg-green-100 text-green-600"
            )}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
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
        
        {isListening && (
          <div className="mt-4 text-center">
            <p className={cn("text-sm font-medium", isDarkMode ? "text-gray-200" : "text-gray-700")}>
              {transcript || "I'm listening..."}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 rounded-full", 
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
