import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import ChatWidget from '../components/chat/ChatWidget';
import { toast } from 'sonner';
import { Users, Hammer, Shield, Youtube, Radio, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROLES = [
  {
    key: 'helper',
    label: 'Хелпер',
    icon: Users,
    color: 'from-blue-600/30 to-blue-900/30 border-blue-500/40',
    activeColor: 'from-blue-600/60 to-blue-900/60 border-blue-400',
    desc: 'Помогаешь новым игрокам освоиться на сервере',
  },
  {
    key: 'builder',
    label: 'Билдер',
    icon: Hammer,
    color: 'from-amber-600/30 to-amber-900/30 border-amber-500/40',
    activeColor: 'from-amber-600/60 to-amber-900/60 border-amber-400',
    desc: 'Создаёшь постройки и локации для сервера',
  },
  {
    key: 'moderator',
    label: 'Модератор',
    icon: Shield,
    color: 'from-red-600/30 to-red-900/30 border-red-500/40',
    activeColor: 'from-red-600/60 to-red-900/60 border-red-400',
    desc: 'Следишь за порядком и безопасностью',
  },
  {
    key: 'youtuber',
    label: 'Ютубер',
    icon: Youtube,
    color: 'from-rose-600/30 to-rose-900/30 border-rose-500/40',
    activeColor: 'from-rose-600/60 to-rose-900/60 border-rose-400',
    desc: 'Снимаешь видео о сервере на YouTube',
  },
  {
    key: 'streamer',
    label: 'Стример',
    icon: Radio,
    color: 'from-purple-600/30 to-purple-900/30 border-purple-500/40',
    activeColor: 'from-purple-600/60 to-purple-900/60 border-purple-400',
    desc: 'Стримишь на Twitch / VK Play / YouTube',
  },
];

const STEPS = ['role', 'form', 'done'];

export default function Apply() {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    player_name: '',
    discord: '',
    age: '',
    experience: '',
    about: '',
    why: '',
  });

  const handleSubmit = async () => {
    if (!form.player_name.trim() || !form.about.trim() || !form.why.trim()) {
      toast.error('Заполни все обязательные поля');
      return;
    }
    setLoading(true);
    await base44.entities.StaffApplication.create({
      ...form,
      age: form.age ? Number(form.age) : undefined,
      role: selectedRole,
      status: 'pending',
    });
    setLoading(false);
    setStep('done');
  };

  const roleData = ROLES.find(r => r.key === selectedRole);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-3">
            Вступить в <span className="text-primary">команду</span>
          </h1>
          <p className="text-muted-foreground">Подай заявку и стань частью команды MartWorld</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Choose role */}
          {step === 'role' && (
            <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-center text-muted-foreground mb-6 text-sm">Выбери желаемую роль</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLES.map(role => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.key;
                  return (
                    <motion.button
                      key={role.key}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedRole(role.key)}
                      className={`bg-gradient-to-br ${isSelected ? role.activeColor : role.color} border rounded-xl p-5 text-left transition-all duration-200 backdrop-blur-sm shadow-md cursor-pointer w-full ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
                    >
                      <Icon className="w-8 h-8 text-white/80 mb-3" />
                      <h3 className="font-heading font-bold text-white text-lg">{role.label}</h3>
                      <p className="text-white/60 text-xs mt-1">{role.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex justify-center mt-8">
                <Button
                  disabled={!selectedRole}
                  onClick={() => setStep('form')}
                  className="bg-primary hover:bg-primary/90 gap-2 px-8 h-11"
                >
                  Продолжить <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Fill form */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {roleData && (
                <div className={`bg-gradient-to-br ${roleData.activeColor} border rounded-xl p-4 flex items-center gap-3 mb-6`}>
                  <roleData.icon className="w-6 h-6 text-white/80 shrink-0" />
                  <div>
                    <p className="font-heading font-bold text-white">{roleData.label}</p>
                    <p className="text-white/60 text-xs">{roleData.desc}</p>
                  </div>
                  <button onClick={() => setStep('role')} className="ml-auto text-white/40 hover:text-white text-xs underline">изменить</button>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Никнейм *</label>
                    <Input placeholder="Steve123" value={form.player_name} onChange={e => setForm(f => ({ ...f, player_name: e.target.value }))} className="bg-muted border-border" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Discord</label>
                    <Input placeholder="steve#1234" value={form.discord} onChange={e => setForm(f => ({ ...f, discord: e.target.value }))} className="bg-muted border-border" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Возраст</label>
                  <Input type="number" placeholder="16" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="bg-muted border-border w-32" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Опыт (предыдущие сервера/проекты)</label>
                  <textarea
                    placeholder="Расскажи о своём опыте..."
                    value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">О себе *</label>
                  <textarea
                    placeholder="Расскажи о себе — кто ты, сколько играешь в Minecraft..."
                    value={form.about}
                    onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                    className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Почему хочешь в команду? *</label>
                  <textarea
                    placeholder="Почему именно ты подходишь на эту роль?"
                    value={form.why}
                    onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
                    className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <Button variant="outline" onClick={() => setStep('role')}>Назад</Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 px-8">
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Done */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="font-heading font-bold text-3xl text-foreground mb-3">Заявка отправлена!</h2>
              <p className="text-muted-foreground mb-8">Мы рассмотрим твою заявку в ближайшее время. Следи за ответом в Discord.</p>
              <Button variant="outline" onClick={() => { setStep('role'); setSelectedRole(null); setForm({ player_name: '', discord: '', age: '', experience: '', about: '', why: '' }); }}>
                Подать ещё одну
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}