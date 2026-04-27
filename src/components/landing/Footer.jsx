import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-heading font-bold">M</span>
          </div>
          <span className="font-heading font-bold text-foreground">MARTWORLD</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <Link to="/shop" className="hover:text-foreground transition-colors">Магазин</Link>
          <Link to="/news" className="hover:text-foreground transition-colors">Новости</Link>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 MartWorld. Все права защищены.</p>
      </div>
    </footer>
  );
}