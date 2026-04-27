import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart, User, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BuyDialog({ item, open, onClose }) {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleBuy = async () => {
    if (!playerName.trim()) {
      toast.error('Введите никнейм!');
      return;
    }
    setLoading(true);
    await base44.entities.ShopOrder.create({
      player_name: playerName,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      status: 'pending',
      player_email: email,
    });
    toast.success(`Заказ на "${item.name}" создан! Ожидайте обработки.`);
    setPlayerName('');
    setEmail('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Покупка: {item.name}</DialogTitle>
          <DialogDescription>Цена: {item.price}₽</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> Никнейм в игре</Label>
            <Input 
              placeholder="Ваш никнейм"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Email (необязательно)</Label>
            <Input 
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <Button 
            onClick={handleBuy} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? 'Обработка...' : `Оформить за ${item.price}₽`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}