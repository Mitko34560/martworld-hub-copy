import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart, User, Mail, Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BuyDialog({ item, open, onClose }) {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null); // validated coupon object
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const discount = coupon ? Math.round(item.price * coupon.discount_percent / 100) : 0;
  const finalPrice = item.price - discount;

  const handleClose = () => {
    setPlayerName('');
    setEmail('');
    setCouponCode('');
    setCoupon(null);
    setCouponError('');
    setLoading(false);
    onClose();
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);

    const results = await base44.entities.Coupon.filter({ code, active: true });
    const found = results[0];

    if (!found) {
      setCouponError('Промокод не найден или недействителен');
    } else if (found.max_uses > 0 && found.used_count >= found.max_uses) {
      setCouponError('Промокод уже исчерпан');
    } else {
      setCoupon(found);
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

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
      price: finalPrice,
      status: 'pending',
      player_email: email,
    });

    // Increment coupon usage
    if (coupon) {
      await base44.entities.Coupon.update(coupon.id, {
        used_count: (coupon.used_count || 0) + 1,
      });
    }

    toast.success(`Заказ на "${item.name}" создан! Ожидайте обработки.`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Покупка: {item.name}</DialogTitle>
          <DialogDescription>
            {coupon ? (
              <span>
                <span className="line-through text-muted-foreground">{item.price}₽</span>
                {' '}→{' '}
                <span className="text-green-400 font-semibold">{finalPrice}₽</span>
                {' '}(-{coupon.discount_percent}%)
              </span>
            ) : (
              `Цена: ${item.price}₽`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> Никнейм в игре</Label>
            <Input
              placeholder="Ваш никнейм"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Email (необязательно)</Label>
            <Input
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          {/* Coupon */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><Tag className="w-4 h-4" /> Промокод</Label>
            {coupon ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-green-400 text-sm font-semibold flex-1">{coupon.code} — скидка {coupon.discount_percent}%</span>
                <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Введите промокод"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  className="bg-muted border-border uppercase"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                  className="shrink-0"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Применить'}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {couponError}
              </p>
            )}
          </div>

          {/* Price summary */}
          {coupon && (
            <div className="bg-muted/60 rounded-lg px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Цена</span><span>{item.price}₽</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Скидка ({coupon.discount_percent}%)</span><span>-{discount}₽</span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-1 mt-1">
                <span>Итого</span><span>{finalPrice}₽</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? 'Обработка...' : `Оформить за ${finalPrice}₽`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}