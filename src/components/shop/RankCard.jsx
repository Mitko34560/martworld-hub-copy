import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap, Crown, Flame, Shield } from 'lucide-react';

const iconMap = {
  spider: Shield,
  lightning: Zap,
  crown: Crown,
  flame: Flame,
  star: Star,
};

const gradients = {
  brown: 'from-amber-900/80 to-amber-950/90 border-amber-700/40',
  blue: 'from-sky-600/80 to-sky-800/90 border-sky-500/40',
  yellow: 'from-yellow-500/80 to-yellow-700/90 border-yellow-400/40',
  red: 'from-red-700/80 to-red-900/90 border-red-500/40',
};

export default function RankCard({ item, onBuy, index }) {
  const color = item.color || 'brown';
  const Icon = iconMap[item.icon] || Shield;
  const gradient = gradients[color] || gradients.brown;
  const features = item.features || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative bg-gradient-to-br ${gradient} border rounded-xl overflow-hidden flex flex-col`}
    >
      {item.is_popular && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          ПОПУЛЯРНЫЙ
        </div>
      )}
      
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-2xl text-white uppercase">{item.name}</h3>
            <p className="font-heading font-bold text-xl text-white/80">{item.price}₽</p>
          </div>
          <Icon className="w-10 h-10 text-white/60" />
        </div>
        
        <ul className="space-y-1.5 text-sm text-white/80 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-white/50 mt-0.5">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 pt-0">
        <Button 
          onClick={() => onBuy(item)}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          КУПИТЬ ЗА {item.price}₽
        </Button>
      </div>
    </motion.div>
  );
}