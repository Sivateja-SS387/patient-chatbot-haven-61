
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Bot, User, Mic, MicOff, VolumeX, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import speechService from '@/utils/speech/speechService';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [qualityCheckEnabled, setQualityCheckEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isComponentMounted = useRef(false);
  const audioLevelInterval = useRef<number | null>(null);

  const demoQueries = [
    "What medications do I need to take today?",
    "When is my next appointment?",
    "What are the side effects of Lisinopril?",
    "Remind me of my doctor's instructions"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize and setup continuous recording
  useEffect(() => {
    isComponentMounted.current = true;
    
    // When the component loads for the first time
    setTimeout(() => {
      if (isComponentMounted.current) {
        // Speak the welcome message
        const welcomeMessage = messages[0].text;
        if (audioEnabled) {
          speakText(welcomeMessage);
        }
        
        if (isSpeechEnabled) {
          // Start continuous recording
          startContinuousRecording();
        }
      }
    }, 800);
    
    // Monitor audio level for visualization
    audioLevelInterval.current = window.setInterval(() => {
      if (isComponentMounted.current && speechService.isCurrentlyRecording()) {
        setAudioLevel(speechService.getAudioLevel());
      }
    }, 100);
    
    // Clean up function
    return () => {
      isComponentMounted.current = false;
      speechService.stop();
      speechService.stopContinuousRecording();
      
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
        audioLevelInterval.current = null;
      }
    };
  }, []);

  // Toggle audio quality check
  useEffect(() => {
    speechService.setAudioQualityCheck(qualityCheckEnabled);
  }, [qualityCheckEnabled]);

  const startContinuousRecording = async () => {
    try {
      const success = await speechService.startContinuousRecording((audioBlob) => {
        // This callback is called when a recording is complete
        if (audioBlob && audioBlob.size > 0) {
          console.log('Audio recording completed, size:', audioBlob.size);
          setIsRecording(false);
          
          // Here you would typically send this audioBlob to your API for transcription
          // For now, we'll simulate a transcription with a delay
          simulateTranscription(audioBlob);
        }
      });
      
      if (success) {
        setIsListening(true);
        console.log('Continuous recording started successfully');
      } else {
        setIsListening(false);
        toast({
          title: "Recording Error",
          description: "Failed to start continuous recording. Please check microphone permissions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting continuous recording:', error);
      setIsListening(false);
    }
  };

  // Simulate sending the audio to an API and getting a transcription back
  const simulateTranscription = (audioBlob: Blob) => {
    // In a real app, you would send this audio to your API
    console.log('Sending audio blob to API for transcription...');
    
    // For demo purposes, we'll just simulate a transcription after a delay
    setTimeout(() => {
      // Generate a random phrase for demo purposes
      const phrases = [
        "What medications do I need to take today?",
        "When is my next appointment?",
        "What are the side effects of Lisinopril?",
        "Can you remind me of my doctor's instructions?",
        "I need help with my prescription."
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      // Process the transcribed text
      processVoiceInput(randomPhrase);
    }, 1000);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      // Stop continuous recording
      speechService.stopContinuousRecording();
      setIsListening(false);
      setIsSpeechEnabled(false);
    } else {
      setIsSpeechEnabled(true);
      startContinuousRecording();
    }
  };

  const toggleAudio = () => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    
    if (!newAudioState) {
      // Stop any ongoing speech
      speechService.stop();
    } else {
      // Notification that audio is enabled
      toast({
        title: "Voice Output Enabled",
        description: "The assistant will now speak responses aloud.",
      });
    }
  };

  const toggleQualityCheck = () => {
    const newState = !qualityCheckEnabled;
    setQualityCheckEnabled(newState);
    
    toast({
      title: newState ? "Audio Quality Check Enabled" : "Audio Quality Check Disabled",
      description: newState 
        ? "Only intentional speech will be processed." 
        : "All audio will be processed, including background noise.",
    });
  };

  const speakText = async (text: string) => {
    if (!audioEnabled) return;
    
    try {
      setIsSpeaking(true);
      
      // Temporarily pause continuous recording while speaking
      if (isListening) {
        speechService.pauseRecording();
      }
      
      await speechService.speak(text);
      
      // Resume continuous recording after speaking
      if (isListening) {
        speechService.resumeRecording();
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast({
        title: "Speech Error",
        description: "Unable to speak the response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(false);
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
      
      // Speak the bot's response
      speakText(botResponse);
    }, 1000);
  };

  const selectDemoQuery = (query: string) => {
    processVoiceInput(query);
  };

  // Generate audio level visualization bars
  const generateAudioLevelBars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      // Calculate height based on audio level and randomize slightly
      const heightBase = Math.min(20, Math.max(4, audioLevel * 30));
      const height = heightBase + Math.random() * 5;
      
      return (
        <div 
          key={i} 
          className={cn(
            "w-1 rounded-full", 
            isDarkMode ? "bg-spa-400" : "bg-spa-500"
          )}
          style={{ 
            height: `${height}px`,
            animation: `pulse 1s infinite ${i * 0.15}s`
          }}
        ></div>
      );
    });
  };

  return (
    <div className={cn('flex flex-col h-full rounded-lg overflow-hidden', isDarkMode ? 'bg-gray-800' : 'bg-white', className)}>
      <div className={cn("p-4 border-b flex items-center justify-between", isDarkMode ? "bg-gray-700 border-gray-600" : "bg-spa-50 border-gray-200")}>
        <div className="flex items-center gap-2">
          <Volume2 size={20} className={isDarkMode ? "text-spa-300" : "text-spa-600"} />
          <h2 className={isDarkMode ? "font-semibold text-white" : "font-semibold text-spa-900"}>Sails Voice Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={cn(
              "p-1 rounded-full transition-colors",
              audioEnabled
                ? isDarkMode ? "bg-green-900 text-green-100" : "bg-green-100 text-green-800"
                : isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
            )}
            title={audioEnabled ? "Disable voice output" : "Enable voice output"}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={toggleQualityCheck}
            className={cn(
              "p-1 rounded-full transition-colors",
              qualityCheckEnabled
                ? isDarkMode ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-800"
                : isDarkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
            )}
            title={qualityCheckEnabled ? "Disable audio quality check" : "Enable audio quality check"}
          >
            <Settings size={16} />
          </button>
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
        
        {qualityCheckEnabled && (
          <div className="mt-2 mb-2">
            <p className={cn("text-xs", isDarkMode ? "text-green-300" : "text-green-600")}>
              Audio quality check is enabled: Only intentional speech will be processed
            </p>
          </div>
        )}
        
        {isListening && (
          <div className="mt-4 text-center">
            <p className={cn("text-sm font-medium", isDarkMode ? "text-gray-200" : "text-gray-700")}>
              {transcript || "I'm listening..."}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {generateAudioLevelBars()}
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="mt-2 text-center">
            <p className={cn(
              "inline-block px-3 py-1 rounded-full text-xs",
              isDarkMode ? "bg-green-900 text-green-100" : "bg-green-100 text-green-800"
            )}>
              Speaking...
            </p>
          </div>
        )}
        
        {audioLevel > 0.05 && isListening && (
          <div className="mt-2 text-center">
            <p className={cn(
              "inline-block px-3 py-1 rounded-full text-xs",
              isDarkMode ? "bg-red-900 text-red-100" : "bg-red-100 text-red-800"
            )}>
              Recording audio...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
