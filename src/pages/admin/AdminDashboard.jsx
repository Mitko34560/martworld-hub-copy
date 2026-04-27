import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ServerStatusCards from '../../components/admin/ServerStatusCards';
import ServerInfoPanel from '../../components/admin/ServerInfoPanel';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import ActivityChart from '../../components/admin/ActivityChart';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [serverData, setServerData] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);

  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 50),
  });

  useEffect(() => {
    const checkServer = async () => {
      setServerLoading(true);
      try {
        const res = await fetch('https://api.mcsrvstat.us/3/mc.martworld.fun');
        const data = await res.json();
        setServerData(data);
      } catch {
        setServerData(null);
      }
      setServerLoading(false);
    };
    checkServer();
    const interval = setInterval(checkServer, 60000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = serverData?.online;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-60")}>
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Поиск..." className="pl-9 bg-muted border-border h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Статус:</span>
            <Badge className={isOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
              {serverLoading ? '...' : isOnline ? '● Online' : '● Offline'}
            </Badge>
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground mb-6">Добро пожаловать, Admin! Вот что происходит с сервером.</p>
          </motion.div>

          <ServerStatusCards serverData={serverData} loading={serverLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <ActivityChart />
            </div>
            <ServerInfoPanel serverData={serverData} />
          </div>

          <div className="mt-6">
            <RecentOrdersTable orders={orders} />
          </div>
        </main>
      </div>
    </div>
  );
}