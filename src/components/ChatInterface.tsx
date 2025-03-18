
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Bot, User, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ChatInterfaceProps = {
  className?: string;
};

const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Sails Patient Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const demoQuestions = [
    "What are the side effects of ibuprofen?",
    "Is it safe to take aspirin with my heart medication?",
    "How should I store my insulin?",
    "Can you explain my drug interaction warning?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = {
        "What are the side effects of ibuprofen?": "Common side effects of ibuprofen may include upset stomach, mild heartburn, nausea, vomiting, bloating, gas, diarrhea, constipation, dizziness, or headache. If any of these effects persist or worsen, contact your healthcare provider promptly.",
        "Is it safe to take aspirin with my heart medication?": "Aspirin can interact with many heart medications. For example, taking aspirin with blood thinners like warfarin can increase bleeding risk. Always consult your doctor before combining medications.",
        "How should I store my insulin?": "Unopened insulin should be stored in the refrigerator between 36°F to 46°F (2°C to 8°C). Once opened, most insulin can be kept at room temperature (below 86°F or 30°C) for up to 28 days, but check your specific insulin's instructions.",
        "Can you explain my drug interaction warning?": "Drug interaction warnings indicate potential risks when combining medications. The severity can range from minor to life-threatening. I'd need to know the specific medications to provide accurate information. Please consult your pharmacist or doctor for personalized advice."
      };

      const botResponse = botResponses[inputValue as keyof typeof botResponses] || "I don't have specific information about that. Would you like me to find out more about this topic for you?";

      const newBotMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate voice recognition after a delay
      setTimeout(() => {
        setInputValue("How should I store my insulin?");
        setIsRecording(false);
      }, 2000);
    }
  };

  const selectDemoQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn('flex flex-col h-full rounded-lg overflow-hidden', isDarkMode ? 'bg-gray-800' : 'bg-white', className)}>
      <div className={cn("p-4 border-b flex items-center justify-between", isDarkMode ? "bg-gray-700 border-gray-600" : "bg-spa-50 border-gray-200")}>
        <div className="flex items-center gap-2">
          <Bot size={20} className={isDarkMode ? "text-spa-300" : "text-spa-600"} />
          <h2 className={isDarkMode ? "font-semibold text-white" : "font-semibold text-spa-900"}>Sails Patient Assistant</h2>
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
          {isTyping && (
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
          <p className={cn("text-xs mb-2", isDarkMode ? "text-gray-300" : "text-gray-500")}>Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {demoQuestions.map((question, index) => (
              <button
                key={index}
                className={cn("px-3 py-1 rounded-full text-xs transition-colors", 
                  isDarkMode 
                    ? "bg-spa-700 text-spa-200 hover:bg-spa-600" 
                    : "bg-spa-100 text-spa-700 hover:bg-spa-200"
                )}
                onClick={() => selectDemoQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
        
        <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 border focus-within:ring-2 focus-within:ring-spa-500 focus-within:border-transparent", 
          isDarkMode 
            ? "bg-gray-800 border-gray-600" 
            : "bg-white border-gray-200"
        )}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className={cn("flex-1 outline-none text-sm bg-transparent", 
              isDarkMode ? "text-white placeholder-gray-400" : "text-gray-800"
            )}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleRecording}
            className={cn(
              'p-2 rounded-full',
              isRecording 
                ? 'bg-red-100 text-red-500' 
                : isDarkMode 
                  ? 'text-gray-300 hover:text-spa-300' 
                  : 'text-gray-400 hover:text-spa-500'
            )}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={inputValue.trim() === ''}
            className={cn(
              'p-2 rounded-full',
              inputValue.trim() === '' 
                ? isDarkMode ? 'text-gray-500' : 'text-gray-300'
                : isDarkMode 
                  ? 'bg-spa-600 text-white hover:bg-spa-500' 
                  : 'bg-spa-500 text-white hover:bg-spa-600'
            )}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
