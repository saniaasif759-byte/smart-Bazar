import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onDealsClick: () => void;
}

export default function Hero({ onGetStarted, onDealsClick }: HeroProps) {
  return (
    <section className="relative px-4 py-12 md:px-8 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Smart Shopping
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight"
          >
            Grocery Shopping <br />
            <span className="text-emerald-600">Smarter & Cheaper.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0"
          >
            Real-time price comparison across 50+ stores. Save on every item and optimize your monthly grocery budget.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-emerald-200"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onDealsClick}
              className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Tag className="w-5 h-5 text-emerald-600" />
              Today's Deals
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="flex-1 relative"
        >
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000" 
              alt="Fresh Groceries" 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute top-6 left-6 right-6">
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lowest Price Found</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-15% Today</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">🥛</div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none">Fresh Milk (1L)</h3>
                    <p className="text-gray-500 text-sm mt-1">Rs.68 at Metro Cash & Carry</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-lg font-black text-emerald-600">Rs.68</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="absolute bottom-6 right-6">
               <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white/20 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-sm">Save Rs.450 on List #12</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60 -z-1"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60 -z-1"></div>
        </motion.div>
      </div>
    </section>
  );
}
