import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminAuthGate from '../../components/admin/AdminAuthGate';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = { pending: 'Ожидает', completed: 'Выполнен', cancelled: 'Отменён' };

export default function AdminOrders() {
  const [collapsed, setCollapsed] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => base44.entities.ShopOrder.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Статус обновлён');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShopOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast.success('Заказ удалён');
    },
  });

  return (
    <AdminAuthGate>
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Заказы</h1>
        </motion.div>
        
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Нет заказов</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Игрок</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.player_name}</TableCell>
                        <TableCell>{order.item_name}</TableCell>
                        <TableCell className="text-muted-foreground">{order.item_category}</TableCell>
                        <TableCell>{order.price}₽</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{order.player_email || '—'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || statusColors.pending}>
                            {statusLabels[order.status] || 'Ожидает'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.created_date ? format(new Date(order.created_date), 'dd.MM.yy HH:mm') : ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {order.status === 'pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-400 hover:text-green-300"
                                  onClick={() => updateMutation.mutate({ id: order.id, data: { status: 'completed' } })}>
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300"
                                  onClick={() => updateMutation.mutate({ id: order.id, data: { status: 'cancelled' } })}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteMutation.mutate(order.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminAuthGate>
  );
}