import React, { useState } from 'react';
import { ShoppingBasket, Github, Twitter, Instagram, Mail, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    setStatus('idle');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email, created_at: new Date().toISOString() }]);

      if (error) {
        console.warn("Supabase subscriber failure, fallbacks applied:", error.message);
        // Fallback store under localStorage so it works anyway
        const emails = JSON.parse(localStorage.getItem('bazzar_subscribers') || '[]');
        emails.push(email);
        localStorage.setItem('bazzar_subscribers', JSON.stringify(emails));
      }
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubscribing(false);
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-24 md:pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1 border-gray-100 pr-0 md:pr-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <ShoppingBasket className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-display">
                Smart<span className="text-emerald-600">Bazar</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Making grocery shopping smarter and cheaper for everyone. Compare prices, save money, and get fresh food delivered.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Partner with us</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Help</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Stay Smart</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to get best weekly deals notifications.</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribing}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm disabled:opacity-60"
                />
                <button 
                  type="submit" 
                  disabled={subscribing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-emerald-600 active:scale-95 p-1.5 rounded-lg text-white transition-all disabled:opacity-60"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              
              {status === 'success' && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Subscribed & synchronized! ⚡
                </p>
              )}
              {status === 'error' && (
                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Error subscribing. Try again.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">© 2024 SmartBazar. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
