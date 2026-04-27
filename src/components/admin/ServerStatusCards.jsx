import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, Server, Activity, Cpu, HardDrive } from 'lucide-react';

export default function ServerStatusCards({ serverData, loading }) {
  const isOnline = serverData?.online;
  const players = serverData?.players;
  const version = serverData?.version || '—';

  const cards = [
    {
      icon: Users,
      label: 'ИГРОКИ ОНЛАЙН',
      value: loading ? '...' : `${players?.online || 0} / ${players?.max || 100}`,
      sub: `${Math.round(((players?.online || 0) / (players?.max || 100)) * 100)}% от макс.`,
      color: 'text-primary bg-primary/10',
    },
    {
      icon: isOnline ? Wifi : WifiOff,
      label: 'СТАТУС СЕРВЕРА',
      value: loading ? '...' : isOnline ? 'Online' : 'Offline',
      sub: isOnline ? 'Сервер работает' : 'Сервер недоступен',
      color: isOnline ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10',
    },
    {
      icon: Server,
      label: 'ВЕРСИЯ',
      value: loading ? '...' : version,
      sub: serverData?.software || 'Paper',
      color: 'text-blue-400 bg-blue-400/10',
    },
    {
      icon: Activity,
      label: 'TPS',
      value: '20.00',
      sub: 'Отлично',
      color: 'text-green-400 bg-green-400/10',
    },
    {
      icon: HardDrive,
      label: 'RAM USAGE',
      value: '68%',
      sub: '6.8 GB / 10 GB',
      color: 'text-yellow-400 bg-yellow-400/10',
    },
    {
      icon: Cpu,
      label: 'CPU USAGE',
      value: '23%',
      sub: '2.3 / 10 Cores',
      color: 'text-purple-400 bg-purple-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
            <card.icon className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{card.label}</p>
          <p className="font-heading font-bold text-xl text-foreground mt-1">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}