import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ChevronRight, Heart, Mail, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { Toggle } from '@/components/ui/toggle';

const Index = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [resetEmail, setResetEmail] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      
      if (userData.hasCompletedOnboarding) {
        navigate('/dashboard');
      } else {
        navigate('/user-details');
      }
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
      setError('Please provide your name');
      return;
    }
    
    setIsLoading(true);
    
    if (isSignUp) {
      setTimeout(() => {
        const userData = {
          email: username,
          name: name,
          hasCompletedOnboarding: false,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem(username, password);
        
        setIsLoading(false);
        toast({
          title: "Account created successfully",
          description: `Welcome, ${name}! Please complete your profile.`,
        });
        navigate('/user-details');
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);

        if (username === 'nilima.v9@gmail.com' && password === 'Aradhya@01') {
          const userData = {
            email: username,
            name: 'Nilima',
            hasCompletedOnboarding: true,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          toast({
            title: "Login successful",
            description: "Welcome back, Nilima!",
          });
          navigate('/dashboard');
          return;
        }

        const storedPassword = localStorage.getItem(username);
        
        if (storedPassword === password) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          toast({
            title: "Login successful",
            description: `Welcome back, ${userData.name}!`,
          });
          
          if (userData.hasCompletedOnboarding) {
            navigate('/dashboard');
          } else {
            navigate('/user-details');
          }
        } else {
          setError('Invalid email or password');
        }
      }, 1000);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleResetRequest = () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const isHardcodedUser = resetEmail === 'nilima.v9@gmail.com';
    const isRegisteredUser = localStorage.getItem(resetEmail) !== null;

    if (!isHardcodedUser && !isRegisteredUser) {
      toast({
        title: "Email not found",
        description: "This email is not registered in our system",
        variant: "destructive",
      });
      return;
    }

    setForgotPasswordOpen(false);
    setResetPasswordOpen(true);
    toast({
      title: "Reset link sent",
      description: "If your email is registered, you'll receive reset instructions",
    });
  };

  const handlePasswordReset = () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (resetEmail === 'nilima.v9@gmail.com') {
      toast({
        title: "Success",
        description: "Your password has been updated. Please sign in with your new password.",
      });
    } else {
      localStorage.setItem(resetEmail, newPassword);
      toast({
        title: "Success",
        description: "Your password has been updated. Please sign in with your new password.",
      });
    }

    setResetSuccess(true);
    setTimeout(() => {
      setResetPasswordOpen(false);
      setResetSuccess(false);
      setNewPassword('');
      setConfirmPassword('');
      setResetEmail('');
    }, 2000);
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

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div 
        className={`absolute inset-0 -z-10 ${isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
          : "bg-gradient-to-br from-spa-50 via-white to-spa-100"} bg-[length:400%_400%]`}
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      />
      
      <header className="py-6 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Heart className={isDarkMode ? "text-spa-300 mr-2" : "text-spa-500 mr-2"} size={24} />
          <span className={isDarkMode 
            ? "text-xl font-semibold text-white" 
            : "text-xl font-semibold bg-gradient-to-r from-spa-700 to-spa-500 bg-clip-text text-transparent"}>
            Sails Patient Assistant
          </span>
        </div>
        <Toggle 
          aria-label="Toggle dark mode" 
          className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"}`}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-spa-600" />
          )}
        </Toggle>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-xl shadow-xl overflow-hidden`}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`inline-flex h-16 w-16 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-spa-100"} items-center justify-center mb-4`}
                >
                  <Heart className={isDarkMode ? "text-spa-300" : "text-spa-500"} size={32} />
                </motion.div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} mt-1`}>
                  {isSignUp ? 'Sign up for your patient account' : 'Sign in to your patient account'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`${isDarkMode ? "bg-red-900/50 text-red-200" : "bg-red-50 text-red-600"} p-3 rounded-lg text-sm`}
                  >
                    {error}
                  </motion.div>
                )}
                
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="name" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2 border ${isDarkMode 
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-spa-500" 
                          : "border-gray-300 focus:ring-spa-500 focus:border-transparent"} rounded-lg transition-all duration-200`}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="username" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                    <input
                      id="username"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-spa-500" 
                        : "border-gray-300 focus:ring-spa-500 focus:border-transparent"} rounded-lg transition-all duration-200`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                      Password
                    </label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className={`text-sm ${isDarkMode 
                          ? "text-spa-300 hover:text-spa-200" 
                          : "text-spa-600 hover:text-spa-800"} transition-colors`}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-spa-500" 
                        : "border-gray-300 focus:ring-spa-500 focus:border-transparent"} rounded-lg transition-all duration-200`}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`btn-hover-effect w-full ${isDarkMode 
                      ? "bg-spa-500 hover:bg-spa-600" 
                      : "bg-spa-600 hover:bg-spa-700"} text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200`}
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
                        {isSignUp ? 'Create Account' : 'Sign In'} <ChevronRight className="ml-1 h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className={`${isDarkMode 
                      ? "text-spa-300 hover:text-spa-200" 
                      : "text-spa-600 hover:text-spa-800"} font-medium transition-colors`}
                  >
                    {isSignUp ? 'Sign In' : 'Create account'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
          
          <p className={`text-center text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-8`}>
            © 2023 Sails Patient Assistant. All rights reserved.
          </p>
        </div>
      </main>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className={`sm:max-w-[425px] ${isDarkMode ? "bg-gray-800 text-white border-gray-700" : ""}`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? "text-white" : ""}>Reset your password</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-300" : ""}>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reset-email" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : ""}`}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                </div>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`pl-10 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""}`}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setForgotPasswordOpen(false)}
              className={isDarkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : ""}
            >
              Cancel
            </Button>
            <Button onClick={handleResetRequest} className={isDarkMode ? "bg-spa-500 hover:bg-spa-600" : ""}>
              Send reset link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className={`sm:max-w-[425px] ${isDarkMode ? "bg-gray-800 text-white border-gray-700" : ""}`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? "text-white" : ""}>Create new password</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-300" : ""}>
              Please enter your new password below.
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <Alert className={isDarkMode ? "bg-green-900/30 border-green-800 text-green-100" : "bg-green-50 border-green-200"}>
              <AlertDescription className={isDarkMode ? "text-green-100" : "text-green-700"}>
                Password reset successful! You can now log in with your new password.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="new-password" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : ""}`}>
                    New password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`pl-10 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""}`}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : ""}`}>
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                    </div>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""}`}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setResetPasswordOpen(false)}
                  className={isDarkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : ""}
                >
                  Cancel
                </Button>
                <Button onClick={handlePasswordReset} className={isDarkMode ? "bg-spa-500 hover:bg-spa-600" : ""}>
                  Reset password
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
