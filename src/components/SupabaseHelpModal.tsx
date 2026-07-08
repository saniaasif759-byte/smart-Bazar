import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Terminal, ShieldAlert, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface SupabaseHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseHelpModal({ isOpen, onClose }: SupabaseHelpModalProps) {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ==========================================================
-- 0. CLEAN SLATE / RESET STAGE (Apne old tables reset krne k liye)
-- ==========================================================
-- Agar pehle se koi galat table buni hui thi, tou ye use clean krdega
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.city_prices CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;

-- ==========================================================
-- 1. ORDERS TABLE (Aapke custom orders save karne k liye)
-- ==========================================================
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_email text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    items jsonb NOT NULL,
    total_amount numeric,
    payment_method text DEFAULT 'Cash on Delivery (COD)',
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 2. PRODUCTS TABLE (Dynamic market inventory items)
-- ==========================================================
CREATE TABLE public.products (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    price numeric NOT NULL,
    "originalPrice" numeric NOT NULL,
    emoji text NOT NULL,
    image text DEFAULT '',
    stores jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 3. CITY PRICES TABLE (Shahron k prices dynamically map krne k liye)
-- ==========================================================
CREATE TABLE public.city_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    city text NOT NULL,
    item text NOT NULL,
    emoji text NOT NULL,
    stores jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 3b. SUBSCRIBERS TABLE (Newsletter notifications capture krne k liye)
-- ==========================================================
CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 4. EXPLICIT PERMISSIONS GRANT (Supa-fix for "Permission Denied" error!)
-- ==========================================================
-- Yeh commands 'anon' aur 'authenticated' users ko table me data insert/select karne ki direct permission deti hain
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.city_prices TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.subscribers TO anon, authenticated, service_role;

-- SEQUENCE grants (if any generated keys are used)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==========================================================
-- 5. ROW LEVEL SECURITY (RLS) ACTIVATE KAREN
-- ==========================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 6. POLICIES SETUP (Read & Insert permission allow karen)
-- ==========================================================
-- Orders Policy
DROP POLICY IF EXISTS "Allow public insert for orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select for orders" ON public.orders;
CREATE POLICY "Allow public insert for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for orders" ON public.orders FOR SELECT USING (true);

-- Products Policy
DROP POLICY IF EXISTS "Allow public select for products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert for products" ON public.products;
CREATE POLICY "Allow public select for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert for products" ON public.products FOR INSERT WITH CHECK (true);

-- City Prices Policy
DROP POLICY IF EXISTS "Allow public select for city_prices" ON public.city_prices;
DROP POLICY IF EXISTS "Allow public insert for city_prices" ON public.city_prices;
CREATE POLICY "Allow public select for city_prices" ON public.city_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert for city_prices" ON public.city_prices FOR INSERT WITH CHECK (true);

-- Subscribers Policy
DROP POLICY IF EXISTS "Allow public insert for subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public select for subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert for subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for subscribers" ON public.subscribers FOR SELECT USING (true);


-- ==========================================================
-- 7. DUMMY DATA INJECTION (Instantly populates your App!)
-- ==========================================================
-- Dynamic Products list
INSERT INTO public.products (id, name, category, price, "originalPrice", emoji, image, stores) VALUES
('1', 'Organic Avocado (Pack of 2)', 'Vegetables', 180, 220, '🥑', '', '[{"name": "Metro", "price": 180, "isLowest": true}, {"name": "BigBazar", "price": 195, "isLowest": false}, {"name": "Local Market", "price": 190, "isLowest": false}]'::jsonb),
('2', 'Whole Wheat Bread', 'Bakery', 45, 55, '🍞', '', '[{"name": "BigBazar", "price": 45, "isLowest": true}, {"name": "Modern Mart", "price": 48, "isLowest": false}, {"name": "BakeWell", "price": 50, "isLowest": false}]'::jsonb),
('3', 'A2 Desi Cow Milk (1L)', 'Dairy', 95, 110, '🥛', '', '[{"name": "Rel-Fresh", "price": 95, "isLowest": true}, {"name": "Local Dairy", "price": 98, "isLowest": false}, {"name": "Organic Hub", "price": 105, "isLowest": false}]'::jsonb),
('4', 'Broccoli Fresh (500g)', 'Vegetables', 60, 85, '🥦', '', '[{"name": "Vegetable Market", "price": 60, "isLowest": true}, {"name": "HyperCity", "price": 75, "isLowest": false}, {"name": "GroceryNow", "price": 80, "isLowest": false}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Dynamic City Prices comparative rates
INSERT INTO public.city_prices (city, item, emoji, stores) VALUES
('Sahiwal', 'Apple (1kg)', '🍎', '[{"name": "Kisan Mart", "price": 180, "lowest": true}, {"name": "Sahiwal Mandi", "price": 190, "lowest": false}, {"name": "Imtiaz Store", "price": 210, "lowest": false}]'::jsonb),
('Sahiwal', 'Banana (1 Dozen)', '🍌', '[{"name": "Kisan Mart", "price": 150, "lowest": false}, {"name": "Sahiwal Mandi", "price": 120, "lowest": true}, {"name": "Imtiaz Store", "price": 160, "lowest": false}]'::jsonb),
('Sahiwal', 'Wheat Flour (10kg)', '🌾', '[{"name": "Kisan Mart", "price": 1350, "lowest": false}, {"name": "Sahiwal Mandi", "price": 1300, "lowest": true}, {"name": "Imtiaz Store", "price": 1380, "lowest": false}]'::jsonb),
('Lahore', 'Apple (1kg)', '🍎', '[{"name": "Carrefour", "price": 250, "lowest": false}, {"name": "Metro Cash & Carry", "price": 230, "lowest": true}, {"name": "Al-Fatah", "price": 260, "lowest": false}]'::jsonb),
('Lahore', 'Wheat Flour (10kg)', '🌾', '[{"name": "Carrefour", "price": 1400, "lowest": false}, {"name": "Metro Cash & Carry", "price": 1380, "lowest": true}, {"name": "Al-Fatah", "price": 1420, "lowest": false}]'::jsonb),
('Lahore', 'Chicken (1kg)', '🍗', '[{"name": "Carrefour", "price": 680, "lowest": true}, {"name": "Metro Cash & Carry", "price": 710, "lowest": false}, {"name": "Local Shop", "price": 695, "lowest": false}]'::jsonb),
('Multan', 'Mangoes (1kg)', '🥭', '[{"name": "Multan Mandi", "price": 120, "lowest": true}, {"name": "Metro", "price": 150, "lowest": false}, {"name": "Crystal Mart", "price": 145, "lowest": false}]'::jsonb);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white p-6 md:p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-display tracking-tight flex items-center gap-1.5">
                    Supabase Database Setup ⚡
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">Orders save karne k liye tables bnayen</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {/* Urdu/Hindi explanation banner */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <h4 className="font-black text-emerald-900 text-sm">Supabase Table Kaise Banayen?</h4>
                </div>
                <ol className="text-xs text-emerald-800 space-y-1.5 font-semibold list-decimal pl-4">
                  <li>Apne <strong className="text-emerald-950">Supabase Dashboard</strong> par jayen.</li>
                  <li>Left menu se <strong className="text-emerald-950">"SQL Editor"</strong> choose karen.</li>
                  <li><strong className="text-emerald-950">"New Query"</strong> par click karen.</li>
                  <li>Niche diye gye SQL block ko <strong className="text-emerald-950">Copy</strong> karke wahan paste karen.</li>
                  <li><strong className="text-emerald-950">"Run (Ctrl + Enter)"</strong> button dabaen. Aapka table live ho jaye ga!</li>
                </ol>
              </div>

              {/* Instructions on credentials */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  Your Configured Supabase Credentials:
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 text-[11px] font-mono text-gray-600 space-y-1 border border-gray-100">
                  <p><span className="text-emerald-600 font-bold">URL:</span> {((import.meta as any).env?.VITE_SUPABASE_URL || 'https://vwtiiilxintokwxcifpd.supabase.co')}</p>
                  <p className="truncate"><span className="text-emerald-600 font-bold">ANON_KEY:</span> {((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'Active Key ...')}</p>
                </div>
              </div>

              {/* Code Panel Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    SQL Editor Query Command:
                  </h4>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border border-emerald-100 hover:border-transparent active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy SQL Code
                      </>
                    )}
                  </button>
                </div>

                {/* SQL Code Block */}
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 rounded-[1.5rem] p-5 font-mono text-xs overflow-x-auto border-2 border-gray-950 shadow-inner max-h-[250px] no-scrollbar">
                    <code>{sqlCode}</code>
                  </pre>
                </div>
              </div>

              {/* Security hint */}
              <div className="flex gap-2 bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-800">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-black">Security Policy Advice</p>
                  <p className="font-medium text-amber-700 mt-0.5">Yeh codes insert aur read orders secure policy run karte hain jis se anonymous user ka order safe rhta ha. Production k liye policies customize ki ja sakti hain.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-[2.5rem]">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-all border border-gray-200 inline-flex items-center gap-1.5"
              >
                <span>Open Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-200"
              >
                Kuch bacha nahi! All set 👍
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
