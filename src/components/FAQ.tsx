import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: "How does SmartBazar compare prices?",
    answer: "SmartBazar aggregates live pricing data from major retail API feeds and local market reports to show you the lowest cost for everyday items in real-time."
  },
  {
    question: "Which stores are currently supported?",
    answer: "We currently support major chains like BigBazar, Metro, and Reliance, along with estimated pricing for local Mandis (Markets) in your area."
  },
  {
    question: "How do I use Voice Search?",
    answer: "Simply click the microphone icon in the search bar, allow microphone access, and say the name of the product (e.g., 'Tomato' or 'Sugar'). The app will filter results instantly."
  },
  {
    question: "Is the price data updated daily?",
    answer: "Yes, our prices are refreshed every few hours to ensure you get the most accurate information before you head out to shop."
  },
  {
    question: "Can I create a shared shopping list?",
    answer: "Currently, you can add items to your personal list. We are working on a collaborative feature to let you share lists with family members."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Main Questions (FAQ)</h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <motion.div 
            key={i}
            initial={false}
            className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm"
          >
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-gray-800">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            
            <motion.div 
              initial={false}
              animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-gray-50 mx-6">
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
