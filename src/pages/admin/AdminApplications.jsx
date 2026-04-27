import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion } from 'framer-motion';
import { Users, Hammer, Shield, Youtube, Radio, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ROLE_MAP = {
  helper: { label: 'Хелпер', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  builder: { label: 'Билдер', icon: Hammer, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  moderator: { label: 'Модератор', icon: Shield, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  youtuber: { label: 'Ютубер', icon: Youtube, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  streamer: { label: 'Стример', icon: Radio, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

const STATUS_MAP = {
  pending: { label: 'На рассмотрении', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  approved: { label: 'Одобрено', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  rejected: { label: 'Отклонено', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminApplications() {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['staffApplications'],
    queryFn: () => base44.entities.StaffApplication.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StaffApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffApplications'] });
      setExpanded(null);
      setComment('');
    },
  });

  const handleDecision = (app, status) => {
    updateMutation.mutate({ id: app.id, data: { status, admin_comment: comment } });
    toast.success(status === 'approved' ? 'Заявка одобрена!' : 'Заявка отклонена');
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <div className="p-6 max-w-5xl">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-foreground">Заявки на персонал</h1>
            <p className="text-muted-foreground text-sm mt-1">Рассмотрение заявок от игроков</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  filter === f
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Все' : STATUS_MAP[f]?.label}
                {f === 'pending' && apps.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                    {apps.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Заявок нет</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => {
                const role = ROLE_MAP[app.role] || ROLE_MAP.helper;
                const RoleIcon = role.icon;
                const status = STATUS_MAP[app.status] || STATUS_MAP.pending;
                const isOpen = expanded === app.id;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Header row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : app.id)}
                    >
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${role.color}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {role.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{app.player_name}</p>
                        {app.discord && <p className="text-xs text-muted-foreground truncate">{app.discord}</p>}
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${status.color}`}>
                        {status.label}
                      </div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {app.created_date ? format(new Date(app.created_date), 'dd.MM.yyyy') : ''}
                      </p>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="border-t border-border p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {app.age && <Field label="Возраст" value={`${app.age} лет`} />}
                          {app.experience && <Field label="Опыт" value={app.experience} />}
                        </div>
                        <Field label="О себе" value={app.about} />
                        <Field label="Почему хочет в команду" value={app.why} />

                        {app.status === 'pending' && (
                          <div className="pt-2 border-t border-border">
                            <label className="text-xs text-muted-foreground mb-1 block">Комментарий (необязательно)</label>
                            <textarea
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              placeholder="Оставь комментарий для игрока..."
                              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-ring mb-3"
                            />
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleDecision(app, 'approved')}
                                disabled={updateMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 gap-2"
                              >
                                <Check className="w-4 h-4" /> Одобрить
                              </Button>
                              <Button
                                onClick={() => handleDecision(app, 'rejected')}
                                disabled={updateMutation.isPending}
                                variant="destructive"
                                className="gap-2"
                              >
                                <X className="w-4 h-4" /> Отклонить
                              </Button>
                            </div>
                          </div>
                        )}

                        {app.admin_comment && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Комментарий администратора</p>
                            <p className="text-sm text-foreground">{app.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{value}</p>
    </div>
  );
}