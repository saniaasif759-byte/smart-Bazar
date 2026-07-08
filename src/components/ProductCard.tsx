import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, TrendingUp, TrendingDown, Store, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

interface StorePrice {
  name: string;
  price: number;
  isLowest: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  emoji: string;
  stores: StorePrice[];
}

interface ProductCardProps {
  product: Product;
  onAddToList: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToList, onOrderNow }) => {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <motion.div 
      layout
      className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{product.emoji}</div>
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-gray-500 border border-gray-100">
            {product.category}
          </span>
        </div>
        {discount > 0 && (
          <div className="absolute top-4 right-4">
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
              {discount}% OFF
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
          <div className="flex items-center text-xs text-green-600 font-bold">
            <TrendingDown className="w-3 h-3 mr-0.5" />
            Lowest ever
          </div>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-black text-gray-900">Rs.{product.price}</span>
          <span className="text-sm text-gray-400 line-through mb-1">Rs.{product.originalPrice}</span>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Store className="w-3 h-3" />
            Comparison
          </p>
          {product.stores.map((store, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center justify-between text-xs p-2 rounded-xl transition-colors",
                store.isLowest ? "bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-500/20" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <span>{store.name}</span>
              <div className="flex items-center gap-1">
                <span>Rs.{store.price}</span>
                {store.isLowest && <TrendingDown className="w-3 h-3" />}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onAddToList(product)}
            className="bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 p-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span className="text-xs">Add to Cart</span>
          </button>
          <button 
            onClick={() => onOrderNow?.(product)}
            className="bg-emerald-600 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-100"
          >
            <Truck className="w-4 h-4" />
            <span className="text-xs">Order Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
