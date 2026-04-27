import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { Plus, Trash2, Pin, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const categoryLabels = { update: 'Обновление', event: 'Событие', maintenance: 'Тех. работы', announcement: 'Объявление' };

export default function AdminNews() {
  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'announcement', pinned: false });
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adminNews'],
    queryFn: () => base44.entities.NewsPost.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast.success('Новость создана');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NewsPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast.success('Новость обновлена');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast.success('Новость удалена');
    },
  });

  const resetForm = () => {
    setForm({ title: '', content: '', category: 'announcement', pinned: false });
    setEditPost(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setForm({ title: post.title, content: post.content, category: post.category, pinned: post.pinned });
    setEditPost(post);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    if (editPost) {
      updateMutation.mutate({ id: editPost.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("transition-all duration-300 p-6", collapsed ? "ml-16" : "ml-60")}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-foreground">Новости</h1>
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Создать
          </Button>
        </motion.div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Нет новостей</p>
          ) : posts.map(post => (
            <Card key={post.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {post.pinned && <Pin className="w-3 h-3 text-primary" />}
                    <span className="font-heading font-bold text-foreground">{post.title}</span>
                    <Badge variant="outline" className="text-xs">{categoryLabels[post.category]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {post.created_date ? format(new Date(post.created_date), 'dd.MM.yyyy HH:mm') : ''}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(post)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(post.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-heading">{editPost ? 'Редактировать' : 'Создать'} новость</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label>Содержание</Label>
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="bg-muted border-border h-32" />
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
              <div className="flex items-center gap-3">
                <Switch checked={form.pinned} onCheckedChange={v => setForm({ ...form, pinned: v })} />
                <Label>Закрепить</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
                {editPost ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}