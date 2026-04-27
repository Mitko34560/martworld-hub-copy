import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Users, Wifi, WifiOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkServer = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.mcsrvstat.us/3/mc.martworld.fun');
      const data = await res.json();
      setServerStatus(data);
    } catch {
      setServerStatus(null);
    }
    setLoading(false);
  };

  const copyIP = () => {
    navigator.clipboard.writeText('mc.martworld.fun');
    toast.success('IP адрес скопирован!');
  };

  const isOnline = serverStatus?.online;
  const players = serverStatus?.players;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <motion.div 
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Server status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
        >
          {loading ? (
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          ) : isOnline ? (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {loading ? 'Проверка сервера...' : isOnline ? (
              <span className="text-green-400">Онлайн — {players?.online || 0}/{players?.max || 0} игроков</span>
            ) : (
              <span className="text-red-400">Сервер оффлайн</span>
            )}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-heading font-bold text-5xl sm:text-7xl md:text-8xl tracking-tight mb-4"
        >
          <span className="text-foreground">MART</span>
          <span className="text-primary">WORLD</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          Лучший Minecraft сервер с уникальными режимами, привилегиями и незабываемыми приключениями
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            onClick={copyIP}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-12 text-base animate-pulse-glow"
          >
            <Copy className="w-5 h-5" />
            mc.martworld.fun
          </Button>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base border-border hover:bg-muted">
              <Play className="w-5 h-5" />
              Магазин
            </Button>
          </Link>
        </motion.div>

        {/* Server info cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
        >
          {[
            { icon: Users, label: 'Игроки онлайн', value: loading ? '...' : (players?.online || 0) },
            { icon: isOnline ? Wifi : WifiOff, label: 'Статус', value: loading ? '...' : isOnline ? 'Онлайн' : 'Оффлайн' },
            { icon: Play, label: 'Версия', value: serverStatus?.version || '1.20+' },
            { icon: Users, label: 'Макс. игроков', value: loading ? '...' : (players?.max || 100) },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 text-center"
            >
              <item.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="font-heading font-bold text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}