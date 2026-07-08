import React from 'react';
import { motion } from 'motion/react';

const CATEGORIES = [
  { name: 'All', icon: '✨', active: true },
  { name: 'Vegetables', icon: '🥦', active: false },
  { name: 'Fruits', icon: '🍎', active: false },
  { name: 'Dairy & Eggs', icon: '🥚', active: false },
  { name: 'Bakery', icon: '🍞', active: false },
  { name: 'Meat', icon: '🍗', active: false },
  { name: 'Pantry', icon: '🧂', active: false },
  { name: 'Drinks', icon: '🥤', active: false },
];

interface FeaturedCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function FeaturedCategories({ selectedCategory, onCategorySelect }: FeaturedCategoriesProps) {
  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Categories</h2>
        <button 
          onClick={() => onCategorySelect('All')}
          className="text-sm font-bold text-emerald-600 hover:underline"
        >
          View All
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onCategorySelect(cat.name)}
            className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-2xl font-bold transition-all ${
              selectedCategory === cat.name 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-2 ring-offset-2 ring-emerald-600' 
              : 'bg-white border border-gray-100 text-gray-600 hover:border-emerald-200 hover:text-emerald-600'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm">{cat.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
