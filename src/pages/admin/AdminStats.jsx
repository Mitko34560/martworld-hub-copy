import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const COLORS = ['hsl(25, 95%, 53%)', 'hsl(270, 60%, 50%)', 'hsl(145, 60%, 45%)', 'hsl(50, 95%, 55%)', 'hsl(0, 84%, 60%)'];

export default function AdminStats() {
  const [collapsed, setCollapsed] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 500),
  });

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.price || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const uniquePlayers = new Set(orders.map(o => o.player_name)).size;

  const categoryData = Object.entries(
    orders.reduce((acc, o) => { acc[o.item_category || 'other'] = (acc[o.item_category || 'other'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const statCards = [
    { icon: DollarSign, label: 'Общий доход', value: `${totalRevenue}₽`, color: 'text-green-400 bg-green-400/10' },
    { icon: ShoppingCart, label: 'Всего заказов', value: totalOrders, color: 'text-primary bg-primary/10' },
    { icon: TrendingUp, label: 'Выполненных', value: completedOrders, color: 'text-purple-400 bg-purple-400/10' },
    { icon: Users, label: 'Уникальных игроков', value: uniquePlayers, color: 'text-blue-400 bg-blue-400/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Статистика</h1>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="font-heading font-bold text-2xl text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="font-heading text-base">Заказы по категориям</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(230, 10%, 40%)" fontSize={12} />
                    <YAxis stroke="hsl(230, 10%, 40%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(230, 20%, 12%)', border: '1px solid hsl(230, 15%, 20%)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="font-heading text-base">Распределение</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(230, 20%, 12%)', border: '1px solid hsl(230, 15%, 20%)', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}