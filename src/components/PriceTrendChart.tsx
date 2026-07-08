import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', price: 78 },
  { name: 'Tue', price: 75 },
  { name: 'Wed', price: 72 },
  { name: 'Thu', price: 68 },
  { name: 'Fri', price: 70 },
  { name: 'Sat', price: 65 },
  { name: 'Sun', price: 68 },
];

export default function PriceTrendChart() {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-gray-900">Price Trend</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Weekly average • All stores</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full text-xs">
          -8.4% this week
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#059669" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
