import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBasket, Bell, User, MapPin, Mic, MicOff, Loader2 } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onCartClick: () => void;
  isLoggedIn: boolean;
  cartCount: number;
  userName?: string;
  supabaseConnected?: boolean;
  onSupabaseInfoClick?: () => void;
  onOrderHistoryClick?: () => void;
}

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onLoginClick, 
  onLogoutClick, 
  onCartClick,
  isLoggedIn, 
  cartCount,
  userName = "User",
  supabaseConnected = false,
  onSupabaseInfoClick,
  onOrderHistoryClick
}: NavbarProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [setSearchQuery]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const formatDisplayName = (email: string) => {
    if (!email || email === "User") return "User";
    const namePart = email.split('@')[0];
    return namePart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .replace(/[0-9]/g, ''); // Remove numbers for a cleaner name
  };

  const displayName = formatDisplayName(userName);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setSearchQuery('')}
        >
          <div className="bg-emerald-600 p-2 rounded-xl">
            <ShoppingBasket className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 font-display">
            Smart<span className="text-emerald-600">Bazar</span>
          </span>
        </motion.div>

        <form 
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex flex-1 max-w-md mx-8"
        >
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries, stores, or items..."
              className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-24 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition-all ${
                  isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-emerald-600'
                }`}
                title={isListening ? 'Listening...' : 'Voice Search'}
              >
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="listening"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Mic className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <button 
                type="submit"
                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {supabaseConnected && (
            <button 
              onClick={onSupabaseInfoClick}
              title="Click to view Supabase Table SQL Setup"
              className="hidden md:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100/50 shadow-sm hover:bg-emerald-100 hover:text-emerald-800 transition-all active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Active</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 font-medium mr-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>DHA Phase 6, Lahore</span>
          </div>
          <button 
            onClick={onCartClick}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative"
          >
            <ShoppingBasket className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-emerald-600 text-white text-[9px] font-black rounded-full border border-white px-0.5">
                {cartCount}
              </span>
            )}
          </button>
          
          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="relative">
            <button 
              onClick={isLoggedIn ? () => setShowAccountMenu(!showAccountMenu) : onLoginClick}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {isLoggedIn ? displayName : "Login"}
              </span>
            </button>

            <AnimatePresence>
              {showAccountMenu && isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                  onMouseLeave={() => setShowAccountMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-gray-800 break-all">{displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{userName}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 font-medium">Profile Settings</button>
                  <button 
                    onClick={() => {
                      if (onOrderHistoryClick) onOrderHistoryClick();
                      setShowAccountMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                  >
                    Order History
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 font-medium">Favorite Stores</button>
                  <div className="h-px bg-gray-50 my-2"></div>
                  <button 
                    onClick={() => {
                      onLogoutClick();
                      setShowAccountMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar Expansion */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden pt-3 pb-2 overflow-hidden"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setShowMobileSearch(false);
              }}
              className="relative w-full"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                autoFocus
                className="w-full bg-gray-50 border-none rounded-full py-3 pl-10 pr-24 outline-none text-sm focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full ${
                    isListening ? 'bg-red-100 text-red-600' : 'text-gray-400'
                  }`}
                >
                  {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 text-white p-2 rounded-full shadow-sm flex items-center justify-center"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
