
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ChevronRight, Heart } from 'lucide-react';

const Index = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };
  
  const backgroundVariants = {
    initial: {
      backgroundPosition: '0% 0%',
    },
    animate: {
      backgroundPosition: '100% 100%',
      transition: {
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 20,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div 
        className="absolute inset-0 -z-10 bg-gradient-to-br from-spa-50 via-white to-spa-100 bg-[length:400%_400%]"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      />
      
      <header className="py-6 px-8">
        <div className="flex items-center">
          <Heart className="text-spa-500 mr-2" size={24} />
          <span className="text-xl font-semibold bg-gradient-to-r from-spa-700 to-spa-500 bg-clip-text text-transparent">
            Sails Patient Assistant
          </span>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex h-16 w-16 rounded-full bg-spa-100 items-center justify-center mb-4"
                >
                  <Heart className="text-spa-500" size={32} />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-500 mt-1">Sign in to your patient account</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 text-red-600 p-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button type="button" className="text-sm text-spa-600 hover:text-spa-800 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-hover-effect w-full bg-spa-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:bg-spa-700"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        Sign In <ChevronRight className="ml-1 h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button className="text-spa-600 hover:text-spa-800 font-medium transition-colors">
                    Create account
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
          
          <p className="text-center text-xs text-gray-500 mt-8">
            © 2023 Sails Patient Assistant. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
