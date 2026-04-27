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
  money: 'from-green-600/60 to-green-800/60 border-green-500/30',
  kit: 'from-purple-600/60 to-purple-800/60 border-purple-500/30',
  resource: 'from-orange-600/60 to-orange-800/60 border-orange-500/30',
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
      className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 text-center flex flex-col items-center gap-2`}
    >
      <Icon className="w-8 h-8 text-white/70" />
      <h4 className="font-heading font-bold text-sm text-white">{item.name}</h4>
      {item.amount && <p className="text-xs text-white/60">{item.amount}</p>}
      <Button 
        size="sm" 
        onClick={() => onBuy(item)}
        className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs gap-1"
      >
        <ShoppingCart className="w-3 h-3" />
        {item.price}₽
      </Button>
    </motion.div>
  );
}