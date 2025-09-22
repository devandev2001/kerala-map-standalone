import React, { useState, useEffect } from 'react';
import { Phone, Lock, LogIn, Eye, EyeOff, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { fetchWhitelistCsv } from '../utils/whitelistCsv';
import { saveAuthSession, validatePhoneNumber, validatePassword } from '../utils/auth';

interface LoginPageProps {
  onLogin: (phoneNumber: string, fullName?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Local whitelist fallback for phone/password validation
  const localWhitelist: Array<{ phone: string; password: string }> = [
    { phone: '8921697857', password: '8921' },
    { phone: '9745895354', password: '1234' },
    { phone: '9876543210', password: 'admin123' },
    { phone: '9876543211', password: 'user123' },
    { phone: '9876543212', password: 'user123' }
  ];

  // Real-time validation effects
  useEffect(() => {
    if (phoneNumber.length > 0) {
      setPhoneValid(validatePhoneNumber(phoneNumber));
    } else {
      setPhoneValid(null);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordValid(validatePassword(password));
    } else {
      setPasswordValid(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      setLoginAttempts(prev => prev + 1);
      return;
    }

    // Validate password is entered
    if (!validatePassword(password)) {
      setError('Please enter your password');
      setLoginAttempts(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Check CSV whitelist first
      const csvList = await fetchWhitelistCsv();
      const csvUser = csvList.find(
        (entry) => entry.phone === phoneNumber && entry.password === password
      );
      if (csvUser) {
        setShowSuccess(true);
        setTimeout(() => {
          saveAuthSession(phoneNumber, csvUser.full_name);
          onLogin(phoneNumber, csvUser.full_name);
        }, 1000);
        return;
      }

      // Then check local in-code whitelist as a fallback
      const localUser = localWhitelist.find(
        (entry) => entry.phone === phoneNumber && entry.password === password
      );
      if (localUser) {
        setShowSuccess(true);
        setTimeout(() => {
          saveAuthSession(phoneNumber, 'Whitelisted User');
          onLogin(phoneNumber, 'Whitelisted User');
        }, 1000);
        return;
      }

      // If neither whitelist validates, show error
      setLoginAttempts(prev => prev + 1);
      if (loginAttempts >= 2) {
        setError('Multiple failed attempts. Please contact your administrator for assistance.');
      } else {
        setError('Invalid phone number or password. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password field key press for Enter key validation
  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phoneNumber && password) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col justify-center items-center font-sans relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-indigo-400/5 rounded-full animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse"></div>
      
      {/* Animated/Blurred Background */}
      <div className="fixed inset-0 z-0 backdrop-blur-2xl bg-gradient-to-br from-slate-800/30 via-blue-800/20 to-indigo-800/30"></div>
      
      <div className="relative z-10 w-full max-w-md p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Login Card */}
        <div className="bg-white/15 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-[1.02] border border-blue-400/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-2xl mb-3 sm:mb-4">
                <img 
                  src="/bjp-logo.png"
                  alt="BJP Logo" 
                  className="w-36 h-36 sm:w-48 sm:h-48 mx-auto object-contain"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/512px-Bharatiya_Janata_Party_logo.svg.png'; 
                  }}
                />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent mb-2 sm:mb-3">
              BJP Keralam
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-200 mb-4 sm:mb-6">
              Mission 2025
            </h2>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mt-4 sm:mt-6"></div>
          </div>
          
          {/* Login Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} aria-label="Login form">
            <div className="space-y-3 sm:space-y-4">
              {/* Phone Number Field - Mobile Optimized */}
              <div className="relative group">
                <div className={`absolute top-1/2 left-3 sm:left-4 transform -translate-y-1/2 transition-colors duration-300 z-10 ${
                  phoneValid === true ? 'text-green-400' : 
                  phoneValid === false ? 'text-red-400' : 
                  'text-gray-400 group-focus-within:text-blue-400'
                }`}>
                  <Phone size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="absolute left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">+91</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setError(''); // Clear error when user types
                  }}
                  disabled={isLoading}
                  className={`input-field w-full pl-16 sm:pl-20 pr-12 py-3 sm:py-4 transition-all duration-300 ${
                    phoneValid === true ? 'border-green-400 bg-green-500/5' : 
                    phoneValid === false ? 'border-red-400 bg-red-500/5' : 
                    'border-blue-300/30'
                  }`}
                  aria-label="Phone Number"
                  required
                />
                {/* Validation indicator */}
                {phoneValid !== null && (
                  <div className="absolute top-1/2 right-3 sm:right-4 transform -translate-y-1/2">
                    {phoneValid ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <AlertCircle size={18} className="text-red-400" />
                    )}
                  </div>
                )}
                {/* Phone number format hint */}
                {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
                    {10 - phoneNumber.length} more digits needed
                  </div>
                )}
              </div>

              {/* Password Field - Mobile Optimized */}
              <div className="relative group">
                <div className={`absolute top-1/2 left-3 sm:left-4 transform -translate-y-1/2 transition-colors duration-300 z-10 ${
                  passwordValid === true ? 'text-green-400' : 
                  passwordValid === false ? 'text-red-400' : 
                  'text-gray-400 group-focus-within:text-blue-400'
                }`}>
                  <Lock size={18} className="sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  onKeyPress={handlePasswordKeyPress}
                  disabled={isLoading}
                  className={`input-field w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-4 transition-all duration-300 ${
                    passwordValid === true ? 'border-green-400 bg-green-500/5' : 
                    passwordValid === false ? 'border-red-400 bg-red-500/5' : 
                    'border-blue-300/30'
                  }`}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
                    {password.length < 3 ? 'Password too short' : 
                     password.length < 6 ? 'Password is weak' : 
                     'Password looks good'}
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-xs text-blue-300 hover:underline focus:outline-none"
                  tabIndex={0}
                  onClick={() => alert('Please contact your admin to reset your password.')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button - Mobile Optimized */}
              <button
                type="submit"
                disabled={isLoading || !phoneNumber || !password || showSuccess}
                className={`w-full py-3 sm:py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 relative overflow-hidden ${
                  showSuccess 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 cursor-not-allowed'
                    : isLoading || !phoneNumber || !password
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/30 transform hover:scale-105'
                }`}
              >
                {showSuccess ? (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="text-sm sm:text-base">Login Successful!</span>
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-sm sm:text-base">Validating credentials...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      {phoneNumber && password ? 'Validate & Sign In' : 'Sign In'}
                    </span>
                  </span>
                )}
                {/* Button loading shimmer effect */}
                {isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                )}
              </button>
            </div>
            {/* Error Message with animation */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{error}</span>
                {loginAttempts > 0 && (
                  <div className="ml-auto text-xs text-red-400">
                    Attempt {loginAttempts}/3
                  </div>
                )}
              </div>
            )}
            
            {/* Success Message */}
            {showSuccess && (
              <div className="p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm flex items-center backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
                <CheckCircle size={16} className="mr-2 flex-shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm">Login successful! Redirecting to dashboard...</span>
              </div>
            )}
            
            {/* Progress indicator for multiple attempts */}
            {loginAttempts > 0 && loginAttempts < 3 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(loginAttempts / 3) * 100}%` }}
                ></div>
              </div>
            )}
          </form>
          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-400/20">
            <p className="text-xs text-gray-300 text-center mt-3 sm:mt-4 px-2">
              For authorized use only. 2025 BJP Kerala. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      {/* Responsive mobile hint */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 sm:hidden text-xs text-gray-200 bg-blue-800/30 px-3 py-1 rounded-full shadow-md backdrop-blur-md">
        Best viewed in portrait mode
      </div>
    </div>
  );
};