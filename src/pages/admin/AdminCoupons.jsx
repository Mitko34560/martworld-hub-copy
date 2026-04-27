import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminAuthGate from '../../components/admin/AdminAuthGate';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const defaultForm = { code: '', discount_percent: '', max_uses: '' };

export default function AdminCoupons() {
  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: coupons = [] } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Coupon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setForm(defaultForm);
      setShowForm(false);
      toast.success('Купон создан');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Coupon.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCoupons'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Купон удалён');
    },
  });

  const handleCreate = () => {
    const code = form.code.trim().toUpperCase();
    const discount = Number(form.discount_percent);
    if (!code || !discount || discount < 1 || discount > 100) {
      toast.error('Заполните код и корректный процент скидки (1-100)');
      return;
    }
    createMutation.mutate({
      code,
      discount_percent: discount,
      max_uses: Number(form.max_uses) || 0,
      used_count: 0,
      active: true,
    });
  };

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-background">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" /> Промокоды
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Управление купонами и скидками</p>
            </div>
            <Button onClick={() => setShowForm(v => !v)} className="gap-2">
              <Plus className="w-4 h-4" /> Создать
            </Button>
          </motion.div>

          {/* Create form */}
          {showForm && (
            <Card className="bg-card border-border mb-6">
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Промокод</Label>
                  <Input
                    placeholder="SUMMER20"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="bg-muted border-border uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Скидка (%)</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    min={1} max={100}
                    value={form.discount_percent}
                    onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Макс. использований (0 = ∞)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>Создать</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div className="space-y-2">
            {coupons.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Нет промокодов — создайте первый</p>
              </div>
            ) : coupons.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="font-heading font-bold text-lg text-foreground min-w-[120px]">{c.code}</div>
                    <Badge className="bg-primary/10 text-primary border-primary/30 border">{c.discount_percent}% скидка</Badge>
                    <div className="text-sm text-muted-foreground">
                      {c.used_count || 0}/{c.max_uses > 0 ? c.max_uses : '∞'} использований
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      {c.active
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <XCircle className="w-4 h-4 text-muted-foreground" />}
                      <Switch
                        checked={!!c.active}
                        onCheckedChange={val => toggleMutation.mutate({ id: c.id, active: val })}
                      />
                    </div>
                    <Button
                      size="icon" variant="ghost"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminAuthGate>
  );
}