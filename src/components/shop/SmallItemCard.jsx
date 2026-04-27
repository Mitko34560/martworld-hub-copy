import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Coins, Swords, Package } from 'lucide-react';

const categoryIcons = {
  money: Coins,
  kit: Swords,
  resource: Package,
};

const categoryColors = {
  money: 'from-violet-600/60 to-purple-900/60 border-violet-500/30',
  kit: 'from-fuchsia-600/60 to-purple-800/60 border-fuchsia-500/30',
  resource: 'from-indigo-600/60 to-violet-900/60 border-indigo-500/30',
};

export default function SmallItemCard({ item, onBuy, index }) {
  const Icon = categoryIcons[item.category] || Package;
  const colorClass = categoryColors[item.category] || categoryColors.resource;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 text-center flex flex-col items-center gap-2 backdrop-blur-sm shadow-md shadow-violet-950/40 hover:shadow-violet-700/25 hover:shadow-lg transition-shadow duration-300`}
    >
      <Icon className="w-8 h-8 text-white/70" />
      <h4 className="font-heading font-bold text-sm text-white">{item.name}</h4>
      {item.amount && <p className="text-xs text-white/60">{item.amount}</p>}
      <motion.button
        onClick={() => onBuy(item)}
        whileHover={{ scale: 1.07, backgroundColor: 'rgba(255,255,255,0.28)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="w-full mt-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 text-white border border-white/30 text-xs font-semibold cursor-pointer"
      >
        <ShoppingCart className="w-3 h-3" />
        {item.price}₽
      </motion.button>
    </motion.div>
  );
}