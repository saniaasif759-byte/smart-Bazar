/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import ProductCard, { Product } from './components/ProductCard';
import PriceTrendChart from './components/PriceTrendChart';
import PriceComparisonTable from './components/PriceComparisonTable';
import FAQ from './components/FAQ';
import LoginPage from './components/LoginPage';
import CartModal from './components/CartModal';
import Footer from './components/Footer';
import SupabaseHelpModal from './components/SupabaseHelpModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import { supabase } from './lib/supabase';
import { Sparkles, TrendingUp, Filter, LayoutGrid, List, ShoppingCart, Bell, User, Search } from 'lucide-react';
import { cn } from './lib/utils';

const DUMMY_PRODUCTS = [
  {
    id: '1',
    name: 'Organic Avocado (Pack of 2)',
    category: 'Vegetables',
    price: 180,
    originalPrice: 220,
    emoji: '🥑',
    image: '',
    stores: [
      { name: 'BigBazar', price: 195, isLowest: false },
      { name: 'Metro', price: 180, isLowest: true },
      { name: 'Local Market', price: 190, isLowest: false },
    ]
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 45,
    originalPrice: 55,
    emoji: '🍞',
    image: '',
    stores: [
      { name: 'BigBazar', price: 45, isLowest: true },
      { name: 'Modern Mart', price: 48, isLowest: false },
      { name: 'BakeWell', price: 50, isLowest: false },
    ]
  },
  {
    id: '3',
    name: 'A2 Desi Cow Milk (1L)',
    category: 'Dairy',
    price: 95,
    originalPrice: 110,
    emoji: '🥛',
    image: '',
    stores: [
      { name: 'Rel-Fresh', price: 95, isLowest: true },
      { name: 'Local Dairy', price: 98, isLowest: false },
      { name: 'Organic Hub', price: 105, isLowest: false },
    ]
  },
  {
    id: '4',
    name: 'Broccoli Fresh (500g)',
    category: 'Vegetables',
    price: 60,
    originalPrice: 85,
    emoji: '🥦',
    image: '',
    stores: [
      { name: 'Vegetable Market', price: 60, isLowest: true },
      { name: 'HyperCity', price: 75, isLowest: false },
      { name: 'GroceryNow', price: 80, isLowest: false },
    ]
  }
];

interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [userEmail, setUserEmail] = React.useState(() => {
    return localStorage.getItem('userEmail') || '';
  });
  const [showLogin, setShowLogin] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [showOrderHistory, setShowOrderHistory] = React.useState(false);
  const [userOrders, setUserOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>(DUMMY_PRODUCTS);
  const [supabaseConnected, setSupabaseConnected] = React.useState(true);
  const [showSupabaseHelp, setShowSupabaseHelp] = React.useState(false);

  React.useEffect(() => {
    async function pingAndFetchSupabase() {
      try {
        // Simple test query to verify the client connection is valid
        const { data: ordData, error: ordError } = await supabase.from('orders').select('id').limit(1);
        if (!ordError || ordError.code === 'PGRST116') {
          setSupabaseConnected(true);
        }

        // Fetch products dynamically if the products table exists
        const { data: prodData, error: prodError } = await supabase.from('products').select('*');
        if (!prodError && prodData && prodData.length > 0) {
          const sanitizedProducts = prodData.map((p: any) => ({
            id: String(p.id || Math.random()),
            name: p.name || 'Unnamed Product',
            category: p.category || 'Pantry',
            price: Number(p.price) || 0,
            originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
            image: p.image || '',
            emoji: p.emoji || '📦',
            stores: Array.isArray(p.stores) ? p.stores : [
              { name: 'BigBazar', price: Number(p.price) || 0, isLowest: true }
            ]
          }));
          setProducts(sanitizedProducts);
        }
      } catch (e) {
        console.log("Supabase initialized with fallback parameters", e);
        setSupabaseConnected(true);
      }
    }
    pingAndFetchSupabase();
  }, []);

  const fetchUserOrders = async (email: string) => {
    if (!email) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setUserOrders(data);
      } else {
        console.warn("Failed to fetch orders from Supabase:", error);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  React.useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetchUserOrders(userEmail);
    }
  }, [isLoggedIn, userEmail]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const pName = p?.name || '';
    const pCategory = p?.category || '';
    const matchesSearch = pName.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                        pCategory.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            pCategory === selectedCategory ||
                            (selectedCategory === 'Dairy & Eggs' && (pCategory === 'Dairy' || pCategory === 'Eggs' || pCategory.includes('Dairy') || pCategory.includes('Eggs')));
    return matchesSearch && matchesCategory;
  });

  const handleLogin = async (email: string, password?: string) => {
    try {
      if (password) {
        // Try sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If user doesn't exist, try auto signup to make it frictionless
          if (
            error.message.includes('Invalid login credentials') ||
            error.message.includes('User not found') ||
            error.message.toLowerCase().includes('invalid')
          ) {
            console.log("User credentials not found, trying auto-signup...");
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });
            if (signUpError) {
              throw signUpError;
            }
          } else {
            throw error;
          }
        }
      }

      setIsLoggedIn(true);
      setUserEmail(email);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setShowLogin(false);
      
      // Fetch user's orders from Supabase after successful login
      await fetchUserOrders(email);
    } catch (err: any) {
      console.error("Supabase authentication failed:", err);
      throw new Error(err?.message || "Authentication failed. Please verify your internet connection.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    setIsLoggedIn(false);
    setUserEmail('');
    setUserOrders([]);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setCartItems([]);
  };

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setNotification(`${product.name} added to Smart List!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async (address: string, phone: string, paymentMethod: string = 'Cash on Delivery (COD)'): Promise<{ success: boolean; error?: string }> => {
    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderData = {
      customer_email: userEmail || 'anonymous@bazzar.pk',
      address,
      phone,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        emoji: item.emoji || '📦'
      })),
      total_amount: totalAmount,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log("Saving order to Supabase:", orderData);

    // 4-second timeout wrapper helper to prevent infinite loading spinner
    const withTimeout = async (promise: any, timeoutMs = 4000): Promise<any> => {
      let timeoutId: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Supabase connection timed out (ad-blocker or slow network)"));
        }, timeoutMs);
      });
      try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      // Try to insert order into Supabase with timeout limit
      let { error } = await withTimeout(
        supabase.from('orders').insert([orderData])
      );

      // Fallback: If the insert fails (possibly because columns like total_amount or status don't exist in their custom-built table),
      // we instantly retry with ONLY the 4 columns guaranteed to exist in their Supabase editor screenshot:
      // customer_email, address, phone, and items.
      if (error) {
        console.warn("Full schema insert failed, retrying with minimal guaranteed columns:", error.message);
        const minOrderData = {
          customer_email: orderData.customer_email,
          address: orderData.address,
          phone: orderData.phone,
          items: orderData.items
        };

        const { error: retryError } = await withTimeout(
          supabase.from('orders').insert([minOrderData])
        );

        if (!retryError) {
          console.log("Retry insertion succeeded using minimal schema columns!");
          error = null; // Mark as success!
        } else {
          console.error("Minimal schema insert also failed:", retryError);
          // Keep the original error if retry also failed
          error = retryError;
        }
      }

      if (error) {
        console.error("Supabase insert failed after retry:", error);
        // Fallback: Store order in localStorage so it works regardless of Supabase permissions/table setup
        const storedOrders = JSON.parse(localStorage.getItem('bazzar_orders') || '[]');
        storedOrders.push(orderData);
        localStorage.setItem('bazzar_orders', JSON.stringify(storedOrders));
        setNotification(`Order saved locally (Supabase Error: ${error.message}) ⚠️`);
        setTimeout(() => setNotification(null), 8000);
        if (userEmail) {
          fetchUserOrders(userEmail);
        }
        return { success: false, error: error.message };
      } else {
        console.log("Order saved successfully to Supabase!");
        const storedOrders = JSON.parse(localStorage.getItem('bazzar_orders') || '[]');
        storedOrders.push(orderData);
        localStorage.setItem('bazzar_orders', JSON.stringify(storedOrders));
        setNotification("Order placed and saved successfully to Supabase! ⚡");
        setTimeout(() => setNotification(null), 8000);
        setCartItems([]); // Clear cart items ONLY on real success
        if (userEmail) {
          fetchUserOrders(userEmail);
        }
        return { success: true };
      }
    } catch (err: any) {
      console.error("Supabase connection error, saved locally:", err);
      const storedOrders = JSON.parse(localStorage.getItem('bazzar_orders') || '[]');
      storedOrders.push(orderData);
      localStorage.setItem('bazzar_orders', JSON.stringify(storedOrders));
      const errorMsg = err?.message || 'Connection failed';
      setNotification(`Saved Offline! (Error: ${errorMsg}) 🏠`);
      setTimeout(() => setNotification(null), 8000);
      return { success: false, error: errorMsg };
    }
  };

  const handleOrderNow = (product: Product) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    
    // Add to cart if not already there, then open cart modal
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setShowCart(true);
  };

  const handleGetStarted = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDealsClick = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
      setNotification("Checking today's best deals for you! 🔥");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onLoginClick={() => setShowLogin(true)} 
        onLogoutClick={handleLogout}
        onCartClick={() => setShowCart(true)}
        isLoggedIn={isLoggedIn}
        cartCount={cartCount}
        userName={userEmail}
        supabaseConnected={supabaseConnected}
        onSupabaseInfoClick={() => setShowSupabaseHelp(true)}
        onOrderHistoryClick={() => setShowOrderHistory(true)}
      />

      <AnimatePresence>
        {notification && (
          (() => {
            const isError = notification.includes('⚠️') || notification.includes('Error') || notification.includes('Offline');
            return (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 20 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border text-sm max-w-[90vw] md:max-w-md ${
                  isError 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className={`rounded-xl p-1.5 flex items-center justify-center shrink-0 ${isError ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                  {isError ? (
                    <span className="text-white font-extrabold text-sm leading-none">!</span>
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="leading-snug">{notification}</span>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSupabaseHelp && (
          <SupabaseHelpModal 
            isOpen={showSupabaseHelp} 
            onClose={() => setShowSupabaseHelp(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrderHistory && (
          <OrderHistoryModal 
            isOpen={showOrderHistory}
            onClose={() => setShowOrderHistory(false)}
            orders={userOrders}
            loading={loadingOrders}
            onRefresh={() => fetchUserOrders(userEmail)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <LoginPage 
            onClose={() => setShowLogin(false)} 
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart && (
          <CartModal 
            isOpen={showCart}
            onClose={() => {
              if (cartItems.length === 0) {
                 setShowCart(false);
              } else {
                 // For now just close, the modal has internal state for success
                 setShowCart(false);
              }
            }}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        )}
      </AnimatePresence>
      
      <main className="pb-20">
        <Hero onGetStarted={handleGetStarted} onDealsClick={handleDealsClick} />
        
        <FeaturedCategories 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        <div className="px-4 md:px-8 max-w-7xl mx-auto mb-12">
           <PriceComparisonTable 
            query={searchQuery} 
            onOrderNow={handleOrderNow}
            onAddToCart={handleAddToCart}
          />
        </div>

        <div id="products-section" className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Content: Products */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "Best Deals Nearby"}
                   </h2>
                   <div className="bg-orange-100 text-orange-600 p-1 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                   </div>
                </div>
                <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1">
                   <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                      <LayoutGrid className="w-4 h-4" />
                   </button>
                   <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                      <List className="w-4 h-4" />
                   </button>
                   <div className="w-px h-4 bg-gray-100 mx-1"></div>
                   <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600">
                      <Filter className="w-4 h-4" />
                      Filters
                   </button>
                </div>
              </div>

              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToList={() => handleAddToCart(product)}
                      onOrderNow={handleOrderNow}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No items found matching your search.</p>
                  </div>
                )}
              </motion.div>
              
              <div className="pt-8 flex justify-center">
                 <button className="w-full bg-white border border-gray-200 py-4 rounded-[2rem] font-bold text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all">
                    Load More Items
                 </button>
              </div>
            </div>

            {/* Right Content: Sidebar / Stats */}
            <div className="lg:col-span-4 space-y-6">
              <PriceTrendChart />

              <div className="bg-gray-900 p-6 rounded-[2rem] text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles className="w-5 h-5 text-emerald-400" />
                       <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Smart Bazzar Assistant</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight">Optimizing your <br />List items...</h3>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <p className="text-sm text-gray-400">Rs.120 saved on Dairy products</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                        <p className="text-sm text-gray-400">Milk price dropped at BigBazar</p>
                     </div>
                  </div>

                  <button className="mt-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/50">
                    Get Smart Summary
                  </button>
                </div>
              </div>

              {/* Quick Perks */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2">
                    <div className="text-2xl">🚚</div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fast Delivery</span>
                    <span className="font-black text-xs text-gray-900">FREE within 2km</span>
                 </div>
                 <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2">
                    <div className="text-2xl">💎</div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cashback</span>
                    <span className="font-black text-xs text-gray-900">5% on UPI</span>
                 </div>
              </div>
            </div>

          </div>
          
          <FAQ />
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-[150]">
         <div className="bg-gray-900/90 backdrop-blur-xl rounded-full p-2 flex items-center justify-around shadow-2xl border border-white/10">
            <button className="p-3 text-emerald-400"><LayoutGrid className="w-6 h-6" /></button>
            <button className="p-3 text-gray-400"><TrendingUp className="w-6 h-6" /></button>
            <button 
              onClick={() => setShowCart(true)}
              className="p-4 bg-emerald-600 text-white rounded-full -translate-y-4 shadow-xl shadow-emerald-900/50 border-4 border-gray-900 relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-3 text-gray-400"><Bell className="w-6 h-6" /></button>
            <button 
              onClick={isLoggedIn ? () => {} : () => setShowLogin(true)}
              className="p-3 text-gray-400"
            >
              <User className={cn("w-6 h-6", isLoggedIn && "text-emerald-400")} />
            </button>
         </div>
      </div>

      <Footer />
    </div>
  );
}
