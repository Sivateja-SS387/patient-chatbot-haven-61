
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const isComponentMounted = useRef(false);
  const startTimeoutRef = useRef<number | null>(null);

  const demoQueries = [
    "What medications do I need to take today?",
    "When is my next appointment?",
    "What are the side effects of Lisinopril?",
    "Remind me of my doctor's instructions"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up function to properly handle all resources
  const cleanupResources = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (error) {
        console.error('Error cleaning up recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (startTimeoutRef.current) {
      window.clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
  };

  // Initialize speech recognition with proper event handlers
  const initializeSpeechRecognition = () => {
    if (!isComponentMounted.current) return;
    
    cleanupResources();
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onstart = () => {
          if (isComponentMounted.current) {
            setIsListening(true);
          }
        };
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          if (!isComponentMounted.current) return;
          
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          
          setTranscript(transcriptValue);
          
          // Reset silence timeout whenever we get a result
          if (silenceTimeoutRef.current) {
            window.clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          
          // If this is a final result (user paused speaking)
          if (result.isFinal) {
            // Set a timeout to detect silence (user stopped speaking)
            silenceTimeoutRef.current = window.setTimeout(() => {
              if (isComponentMounted.current && transcriptValue.trim().length > 0) {
                processVoiceInput(transcriptValue);
              }
            }, 1500); // 1.5 seconds of silence before sending
          }
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
          if (!isComponentMounted.current) return;
          
          console.error('Speech recognition error', event.error);
          
          if (event.error === 'no-speech') {
            // Restart recognition if no speech detected
            safeRestartSpeechRecognition();
          } else if (event.error === 'aborted' || event.error === 'network') {
            // These are often temporary errors, try restart with a slight delay
            if (startTimeoutRef.current) {
              window.clearTimeout(startTimeoutRef.current);
            }
            
            startTimeoutRef.current = window.setTimeout(() => {
              if (isComponentMounted.current && isSpeechEnabled) {
                startSpeechRecognition();
              }
            }, 300);
          } else {
            setIsListening(false);
            setIsSpeechEnabled(false);
            toast({
              title: "Speech Recognition Error",
              description: `Error: ${event.error}. Please try again.`,
              variant: "destructive"
            });
          }
        };
        
        recognitionRef.current.onend = () => {
          if (!isComponentMounted.current) return;
          
          // Auto restart recognition if it ends and isSpeechEnabled is true
          if (isSpeechEnabled) {
            safeRestartSpeechRecognition();
          } else {
            setIsListening(false);
          }
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
  };

  useEffect(() => {
    isComponentMounted.current = true;
    
    // Wait a small amount of time before initializing to ensure clean component mounting
    startTimeoutRef.current = window.setTimeout(() => {
      initializeSpeechRecognition();
      
      if (isSpeechEnabled) {
        startSpeechRecognition();
      }
    }, 300);
    
    // Cleanup function
    return () => {
      isComponentMounted.current = false;
      cleanupResources();
    };
  }, []);

  const startSpeechRecognition = () => {
    try {
      if (!isComponentMounted.current) return;
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        // If recognition doesn't exist for some reason, reinitialize
        initializeSpeechRecognition();
        // Add a small delay before starting
        startTimeoutRef.current = window.setTimeout(() => {
          if (isComponentMounted.current && recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
          }
        }, 200);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      
      // If we get an error (like InvalidStateError), try to reinitialize
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        cleanupResources();
        initializeSpeechRecognition();
        
        // Try again after a short delay
        startTimeoutRef.current = window.setTimeout(() => {
          if (isComponentMounted.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (retryError) {
              console.error('Failed to restart after InvalidStateError:', retryError);
            }
          }
        }, 300);
      }
    }
  };

  const safeRestartSpeechRecognition = () => {
    try {
      if (!isComponentMounted.current || !isSpeechEnabled) return;
      
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        
        startTimeoutRef.current = window.setTimeout(() => {
          if (isComponentMounted.current && recognitionRef.current && isSpeechEnabled) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
              
              // If we get an InvalidStateError, reinitialize completely
              if (error instanceof DOMException && error.name === 'InvalidStateError') {
                cleanupResources();
                initializeSpeechRecognition();
                
                // Try starting again after reinitializing
                startTimeoutRef.current = window.setTimeout(() => {
                  if (isComponentMounted.current && recognitionRef.current && isSpeechEnabled) {
                    try {
                      recognitionRef.current.start();
                    } catch (finalError) {
                      console.error('Failed final restart attempt:', finalError);
                      setIsSpeechEnabled(false);
                    }
                  }
                }, 300);
              }
            }
          }
        }, 200);
      } else {
        // If recognition doesn't exist, reinitialize
        initializeSpeechRecognition();
        
        // Try starting after initialization
        startTimeoutRef.current = window.setTimeout(() => {
          if (isComponentMounted.current && recognitionRef.current && isSpeechEnabled) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Failed to start after reinitialization:', error);
            }
          }
        }, 300);
      }
    } catch (error) {
      console.error('Failed to restart speech recognition:', error);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error aborting recognition:', error);
        }
      }
      setIsListening(false);
      setIsSpeechEnabled(false);
    } else {
      setIsSpeechEnabled(true);
      
      // We might need to reinitialize if the user disabled and re-enables
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      startTimeoutRef.current = window.setTimeout(() => {
        startSpeechRecognition();
      }, 200);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processVoiceInput = (inputText: string) => {
    setIsProcessing(true);
    setTranscript('');
    
    // Add user message
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    
    // Simulate bot response after a delay
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
