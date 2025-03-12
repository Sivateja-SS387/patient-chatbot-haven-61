
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Volume1, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

type VoiceBotProps = {
  className?: string;
  onToggle?: (isActive: boolean) => void;
};

const VoiceBot = ({ className, onToggle }: VoiceBotProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(70);
  const [voiceActivity, setVoiceActivity] = useState(0);
  
  // Simulate voice activity levels
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setVoiceActivity(Math.random() * 80 + 20);
      }, 200);
      
      return () => clearInterval(interval);
    }
    
    return () => {};
  }, [isActive]);
  
  // Simulate bot speaking
  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => {
        setIsSpeaking(true);
        
        setTimeout(() => {
          setIsSpeaking(false);
        }, 5000);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {};
  }, [isActive]);
  
  const toggleActive = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };
  
  const VolumeIcon = getVolumeIcon();
  
  return (
    <div className={cn(
      'p-4 rounded-lg border bg-white overflow-hidden',
      isActive ? 'shadow-lg' : 'shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800">Voice Assistant</h3>
        <motion.button
          onClick={toggleActive}
          className={cn(
            'p-2 rounded-full transition-colors',
            isActive 
              ? 'bg-red-100 text-red-500 hover:bg-red-200' 
              : 'bg-spa-100 text-spa-500 hover:bg-spa-200'
          )}
          whileTap={{ scale: 0.9 }}
        >
          {isActive ? <MicOff size={18} /> : <Mic size={18} />}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-4">
              <div className="relative h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 mx-0.5 rounded-full bg-spa-400"
                      style={{
                        height: `${voiceActivity * Math.sin(i / 2) * 0.5 + 20}%`,
                        transition: 'height 0.2s ease',
                        opacity: isActive ? 0.6 + Math.sin(i) * 0.4 : 0.2,
                      }}
                    />
                  ))}
                </div>
                <div className="z-10 bg-white p-3 rounded-full shadow-lg">
                  <div 
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                      isSpeaking 
                        ? "bg-green-500 text-white animate-pulse" 
                        : "bg-spa-500 text-white"
                    )}
                  >
                    <Mic size={24} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <VolumeIcon size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-600">Volume: {volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-spa-500"
                />
              </div>
              
              <div className="mt-4 text-sm">
                <p className={cn(
                  "py-2 text-center rounded-lg",
                  isSpeaking ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
                )}>
                  {isSpeaking 
                    ? "Responding to your question..." 
                    : "Listening... Ask a question about medication or health."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceBot;
