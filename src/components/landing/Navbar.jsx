import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Shield, Home, Newspaper, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Navbar() {
  const copyIP = () => {
    navigator.clipboard.writeText('mc.martworld.fun');
    toast.success('IP скопирован!');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-heading font-bold text-xl">M</span>
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-foreground tracking-wide">MARTWORLD</span>
            <p className="text-[10px] text-muted-foreground -mt-1">Minecraft Сервер</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <Home className="w-4 h-4" /> Главная
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <ShoppingCart className="w-4 h-4" /> Магазин
            </Button>
          </Link>
          <Link to="/news">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <Newspaper className="w-4 h-4" /> Новости
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyIP}
            className="hidden sm:flex gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Copy className="w-3 h-3" />
            mc.martworld.fun
          </Button>
          <Link to="/admin">
            <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
              <Shield className="w-4 h-4" /> Панель
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}