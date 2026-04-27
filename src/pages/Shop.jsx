import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import RankCard from '../components/shop/RankCard';
import SmallItemCard from '../components/shop/SmallItemCard';
import BuyDialog from '../components/shop/BuyDialog';
import { motion } from 'framer-motion';
import { Crown, Coins, Swords, Package } from 'lucide-react';

export default function Shop() {
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: () => base44.entities.ShopItem.list(),
  });

  const ranks = items.filter(i => i.category === 'rank' && i.active !== false);
  const moneyPacks = items.filter(i => i.category === 'money' && i.active !== false);
  const kits = items.filter(i => i.category === 'kit' && i.active !== false);
  const resources = items.filter(i => i.category === 'resource' && i.active !== false);

  const handleBuy = (item) => setSelectedItem(item);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-3">
            Магазин <span className="text-primary">MartWorld</span>
          </h1>
          <p className="text-muted-foreground">Выбери привилегию или товар и поддержи сервер</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Ranks */}
            {ranks.length > 0 && (
              <Section icon={Crown} title="Привилегии">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ranks.map((item, i) => (
                    <RankCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Money Packs */}
            {moneyPacks.length > 0 && (
              <Section icon={Coins} title="Игровая валюта">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {moneyPacks.map((item, i) => (
                    <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Kits */}
            {kits.length > 0 && (
              <Section icon={Swords} title="Наборы (Киты)">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {kits.map((item, i) => (
                    <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <Section icon={Package} title="Ресурсы">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {resources.map((item, i) => (
                    <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {items.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">Магазин пока пуст</p>
                <p className="text-sm mt-2">Товары появятся скоро!</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <BuyDialog item={selectedItem} open={!!selectedItem} onClose={() => setSelectedItem(null)} />
      <ChatWidget />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-xl text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}