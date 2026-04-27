import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminAuthGate from '../../components/admin/AdminAuthGate';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Activity, ShoppingCart, Newspaper, Crown, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const ACTION_META = {
  order_status_changed: { label: 'Статус заказа', icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  news_deleted: { label: 'Новость удалена', icon: Newspaper, color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  item_price_changed: { label: 'Цена товара', icon: Crown, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
};

export default function AdminLogs() {
  const [collapsed, setCollapsed] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: () => base44.entities.AdminLog.list('-created_date', 200),
    refetchInterval: 15000,
  });

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-background">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Журнал действий
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Все административные действия в реальном времени</p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Журнал пуст — действия появятся здесь</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => {
                const meta = ACTION_META[log.action_type] || { label: log.action_type, icon: Activity, color: 'bg-muted text-muted-foreground border-border' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Card className="bg-card border-border hover:border-border/80 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border shrink-0", meta.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge className={cn("text-xs border", meta.color)}>{meta.label}</Badge>
                            {log.object_name && (
                              <span className="text-sm font-semibold text-foreground truncate">{log.object_name}</span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-xs text-muted-foreground">{log.details}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                            <User className="w-3 h-3" />
                            <span>{log.admin_name || 'Администратор'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 justify-end">
                            <Clock className="w-3 h-3" />
                            <span>{log.created_date ? format(new Date(log.created_date), 'dd MMM yyyy, HH:mm:ss', { locale: ru }) : '—'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminAuthGate>
  );
}