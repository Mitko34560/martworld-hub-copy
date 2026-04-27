import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import RankCard from '../components/shop/RankCard';
import SmallItemCard from '../components/shop/SmallItemCard';
import BuyDialog from '../components/shop/BuyDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coins, Swords, Package } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'Все', icon: null },
  { key: 'rank', label: 'Привилегии', icon: Crown },
  { key: 'money', label: 'Валюта', icon: Coins },
  { key: 'kit', label: 'Киты', icon: Swords },
  { key: 'resource', label: 'Ресурсы', icon: Package },
];

export default function Shop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: () => base44.entities.ShopItem.list(),
  });

  const activeItems = items.filter(i => i.active !== false);
  const ranks = activeItems.filter(i => i.category === 'rank');
  const moneyPacks = activeItems.filter(i => i.category === 'money');
  const kits = activeItems.filter(i => i.category === 'kit');
  const resources = activeItems.filter(i => i.category === 'resource');

  const handleBuy = (item) => setSelectedItem(item);

  const showRanks = activeTab === 'all' || activeTab === 'rank';
  const showMoney = activeTab === 'all' || activeTab === 'money';
  const showKits = activeTab === 'all' || activeTab === 'kit';
  const showResources = activeTab === 'all' || activeTab === 'resource';

  // Filter tabs to only those with items
  const availableTabs = TABS.filter(tab => {
    if (tab.key === 'all') return true;
    if (tab.key === 'rank') return ranks.length > 0;
    if (tab.key === 'money') return moneyPacks.length > 0;
    if (tab.key === 'kit') return kits.length > 0;
    if (tab.key === 'resource') return resources.length > 0;
    return false;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-3">
            Магазин <span className="text-primary">MartWorld</span>
          </h1>
          <p className="text-muted-foreground">Выбери привилегию или товар и поддержи сервер</p>
        </motion.div>

        {/* Category Tabs */}
        {!isLoading && activeItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {availableTabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-card/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground backdrop-blur-sm'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {showRanks && ranks.length > 0 && (
                <Section icon={Crown} title="Привилегии">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ranks.map((item, i) => (
                      <RankCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                    ))}
                  </div>
                </Section>
              )}

              {showMoney && moneyPacks.length > 0 && (
                <Section icon={Coins} title="Игровая валюта">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {moneyPacks.map((item, i) => (
                      <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                    ))}
                  </div>
                </Section>
              )}

              {showKits && kits.length > 0 && (
                <Section icon={Swords} title="Наборы (Киты)">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kits.map((item, i) => (
                      <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                    ))}
                  </div>
                </Section>
              )}

              {showResources && resources.length > 0 && (
                <Section icon={Package} title="Ресурсы">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {resources.map((item, i) => (
                      <SmallItemCard key={item.id} item={item} onBuy={handleBuy} index={i} />
                    ))}
                  </div>
                </Section>
              )}

              {activeItems.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-lg">Магазин пока пуст</p>
                  <p className="text-sm mt-2">Товары появятся скоро!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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