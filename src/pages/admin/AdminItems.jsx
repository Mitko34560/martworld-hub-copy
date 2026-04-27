import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminAuthGate from '../../components/admin/AdminAuthGate';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Crown, Coins, Swords, Package } from 'lucide-react';
import { logAdminAction } from '../../lib/adminLogger';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const categoryLabels = { rank: 'Привилегия', money: 'Валюта', kit: 'Набор', resource: 'Ресурс' };
const categoryIcons = { rank: Crown, money: Coins, kit: Swords, resource: Package };

const defaultForm = {
  name: '', category: 'rank', price: 0, description: '', features: [],
  color: 'brown', icon: 'shield', is_popular: false, amount: '', active: true,
};

export default function AdminItems() {
  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [featuresText, setFeaturesText] = useState('');
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['adminItems'],
    queryFn: () => base44.entities.ShopItem.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShopItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminItems'] }); queryClient.invalidateQueries({ queryKey: ['shopItems'] }); toast.success('Товар создан'); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShopItem.update(id, data).then(res => ({ res, id, data })),
    onSuccess: ({ id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['adminItems'] });
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      toast.success('Товар обновлён');
      if (editItem && editItem.price !== data.price) {
        logAdminAction({
          action_type: 'item_price_changed',
          object_id: id,
          object_name: data.name || editItem?.name || `Товар #${id}`,
          details: `${editItem.price}₽ → ${data.price}₽`,
        });
      }
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShopItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminItems'] }); queryClient.invalidateQueries({ queryKey: ['shopItems'] }); toast.success('Товар удалён'); },
  });

  const resetForm = () => { setForm(defaultForm); setFeaturesText(''); setEditItem(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({
      name: item.name, category: item.category, price: item.price, description: item.description || '',
      features: item.features || [], color: item.color || 'brown', icon: item.icon || 'shield',
      is_popular: item.is_popular || false, amount: item.amount || '', active: item.active !== false,
    });
    setFeaturesText((item.features || []).join('\n'));
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Введите название'); return; }
    const data = { ...form, features: featuresText.split('\n').filter(f => f.trim()) };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminAuthGate>
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-foreground">Товары магазина</h1>
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Добавить
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => {
              const Icon = categoryIcons[item.category] || Package;
              return (
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-heading font-bold text-foreground">{item.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">{categoryLabels[item.category]}</Badge>
                    </div>
                    <p className="text-lg font-bold text-primary mb-2">{item.price}₽</p>
                    {item.amount && <p className="text-xs text-muted-foreground mb-2">{item.amount}</p>}
                    {!item.active && <Badge className="bg-red-500/20 text-red-400 mb-2">Неактивен</Badge>}
                    {item.is_popular && <Badge className="bg-primary/20 text-primary mb-2">Популярный</Badge>}
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="ghost" className="flex-1 h-8 gap-1" onClick={() => handleEdit(item)}>
                        <Edit className="w-3 h-3" /> Изменить
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editItem ? 'Редактировать' : 'Создать'} товар</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-muted border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Цена (₽)</Label>
                  <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="bg-muted border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Количество</Label>
                  <Input placeholder="напр. 1000 монет" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="bg-muted border-border" />
                </div>
              </div>
              {form.category === 'rank' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Цвет</Label>
                    <Select value={form.color} onValueChange={v => setForm({ ...form, color: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brown">Коричневый</SelectItem>
                        <SelectItem value="blue">Синий</SelectItem>
                        <SelectItem value="yellow">Жёлтый</SelectItem>
                        <SelectItem value="red">Красный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Иконка</Label>
                    <Select value={form.icon} onValueChange={v => setForm({ ...form, icon: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spider">Паук</SelectItem>
                        <SelectItem value="lightning">Молния</SelectItem>
                        <SelectItem value="crown">Корона</SelectItem>
                        <SelectItem value="flame">Огонь</SelectItem>
                        <SelectItem value="star">Звезда</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Возможности (каждая с новой строки)</Label>
                <Textarea 
                  value={featuresText} 
                  onChange={e => setFeaturesText(e.target.value)} 
                  placeholder="Доступ к /fly&#10;Цветной ник&#10;VIP чат"
                  className="bg-muted border-border h-28" 
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_popular} onCheckedChange={v => setForm({ ...form, is_popular: v })} />
                  <Label>Популярный</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
                  <Label>Активен</Label>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                {editItem ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AdminAuthGate>
  );
}