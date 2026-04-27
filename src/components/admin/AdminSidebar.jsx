import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Crown, Ticket, Newspaper, Users, ShieldCheck, 
  Tags, BarChart3, LineChart, ScrollText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sections = [
  {
    label: 'ОСНОВНЫЕ',
    items: [
      { icon: LayoutDashboard, label: 'Табло', path: '/admin' },
      { icon: Ticket, label: 'Заказы', path: '/admin/orders' },
      { icon: Newspaper, label: 'Новости', path: '/admin/news' },
    ],
  },
  {
    label: 'МАГАЗИН',
    items: [
      { icon: Crown, label: 'Привилегии', path: '/admin/items' },
    ],
  },
  {
    label: 'АНАЛИТИКА',
    items: [
      { icon: BarChart3, label: 'Статистика', path: '/admin/stats' },
    ],
  },
];

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <span className="text-primary font-heading font-bold text-sm">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm text-foreground truncate">MARTWORLD</p>
            <p className="text-[10px] text-muted-foreground">ADMIN PANEL</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {sections.map((section, si) => (
          <div key={si} className="mb-4">
            {!collapsed && (
              <p className="px-4 text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div className={cn(
                    "mx-2 px-3 py-2 rounded-lg flex items-center gap-3 transition-all text-sm cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}