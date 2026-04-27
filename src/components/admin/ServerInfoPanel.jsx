import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ServerInfoPanel({ serverData }) {
  const copyValue = (val) => {
    navigator.clipboard.writeText(val);
    toast.success('Скопировано!');
  };

  const info = [
    { label: 'IP Адрес', value: 'mc.martworld.fun', copyable: true },
    { label: 'Порт', value: '25565' },
    { label: 'MOTD', value: serverData?.motd?.clean?.[0] || 'MartWorld Server' },
    { label: 'Gamemode', value: 'Survival' },
    { label: 'Макс. игроки', value: String(serverData?.players?.max || 100) },
    { label: 'Версия', value: serverData?.version || '1.20+' },
    { label: 'Whitelist', value: 'Выключен' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Информация о сервере</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {info.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{item.value}</span>
              {item.copyable && (
                <button onClick={() => copyValue(item.value)} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}