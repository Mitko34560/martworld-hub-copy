import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  pending: 'Ожидает',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

export default function RecentOrdersTable({ orders = [] }) {
  const recentOrders = orders.slice(0, 10);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Последние заказы</CardTitle>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">Нет заказов</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Игрок</TableHead>
                  <TableHead className="text-xs">Товар</TableHead>
                  <TableHead className="text-xs">Цена</TableHead>
                  <TableHead className="text-xs">Статус</TableHead>
                  <TableHead className="text-xs">Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm font-medium">{order.player_name}</TableCell>
                    <TableCell className="text-sm">{order.item_name}</TableCell>
                    <TableCell className="text-sm">{order.price}₽</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || statusColors.pending}>
                        {statusLabels[order.status] || 'Ожидает'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.created_date ? format(new Date(order.created_date), 'dd.MM.yy HH:mm') : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}