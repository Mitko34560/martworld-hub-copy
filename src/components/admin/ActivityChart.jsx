import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { day: 'Пн', players: 12 },
  { day: 'Вт', players: 19 },
  { day: 'Ср', players: 15 },
  { day: 'Чт', players: 28 },
  { day: 'Пт', players: 35 },
  { day: 'Сб', players: 42 },
  { day: 'Вс', players: 38 },
];

export default function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Активность игроков</CardTitle>
        <p className="text-xs text-muted-foreground">Последние 7 дней</p>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 18%)" />
              <XAxis dataKey="day" stroke="hsl(230, 10%, 40%)" fontSize={12} />
              <YAxis stroke="hsl(230, 10%, 40%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(230, 20%, 12%)', 
                  border: '1px solid hsl(230, 15%, 20%)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="players" 
                stroke="hsl(25, 95%, 53%)" 
                fillOpacity={1} 
                fill="url(#colorPlayers)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}