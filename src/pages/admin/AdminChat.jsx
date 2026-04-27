import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import AdminAuthGate from '../../components/admin/AdminAuthGate';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Send, User, Shield, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminChat() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);

  const { data: allMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['adminChat'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500),
    refetchInterval: 5000,
  });

  // Group by session
  const sessions = Object.values(
    allMessages.reduce((acc, msg) => {
      if (!acc[msg.session_id]) {
        acc[msg.session_id] = {
          session_id: msg.session_id,
          player_name: msg.player_name,
          messages: [],
          last_message: msg,
          unread: 0,
        };
      }
      acc[msg.session_id].messages.push(msg);
      if (!msg.is_admin && !msg.is_read) acc[msg.session_id].unread++;
      // Keep latest message as preview
      if (new Date(msg.created_date) > new Date(acc[msg.session_id].last_message.created_date)) {
        acc[msg.session_id].last_message = msg;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.last_message.created_date) - new Date(a.last_message.created_date));

  const sessionMessages = selectedSession
    ? allMessages
        .filter(m => m.session_id === selectedSession)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  const selectedSessionInfo = sessions.find(s => s.session_id === selectedSession);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages.length]);

  // Mark as read when session selected
  useEffect(() => {
    if (!selectedSession) return;
    const unreadMsgs = allMessages.filter(m => m.session_id === selectedSession && !m.is_admin && !m.is_read);
    unreadMsgs.forEach(m => base44.entities.ChatMessage.update(m.id, { is_read: true }));
  }, [selectedSession, allMessages.length]);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminChat'] });
      setReply('');
    },
  });

  const handleSend = () => {
    if (!reply.trim() || !selectedSession || !selectedSessionInfo) return;
    sendMutation.mutate({
      player_name: 'Администратор',
      message: reply.trim(),
      is_admin: true,
      session_id: selectedSession,
      is_read: true,
    });
  };

  const totalUnread = sessions.reduce((s, sess) => s + sess.unread, 0);

  return (
    <AdminAuthGate>
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("transition-all duration-300 h-screen flex flex-col", collapsed ? "ml-16" : "ml-60")}>
        {/* Header */}
        <div className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-xl text-foreground">Чат поддержки</h1>
            {totalUnread > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{totalUnread} новых</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sessions list */}
          <div className="w-72 border-r border-border overflow-y-auto scrollbar-thin shrink-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-12 px-4">Сообщений пока нет</p>
            ) : sessions.map(sess => (
              <button
                key={sess.session_id}
                onClick={() => setSelectedSession(sess.session_id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors",
                  selectedSession === sess.session_id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{sess.player_name}</span>
                  </div>
                  {sess.unread > 0 && (
                    <span className="w-5 h-5 bg-primary rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                      {sess.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{sess.last_message.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {sess.last_message.created_date ? format(new Date(sess.last_message.created_date), 'dd.MM HH:mm') : ''}
                </p>
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedSession ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Выбери диалог слева</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="border-b border-border px-6 py-3 bg-card/50 flex items-center gap-2 shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-heading font-bold text-foreground">{selectedSessionInfo?.player_name}</span>
                  <span className="text-xs text-muted-foreground ml-1">— {sessionMessages.length} сообщений</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                  {sessionMessages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex flex-col gap-1', msg.is_admin ? 'items-end' : 'items-start')}
                    >
                      <div className={cn('flex items-center gap-1 text-[10px]', msg.is_admin ? 'flex-row-reverse' : '')}>
                        {msg.is_admin ? (
                          <><Shield className="w-3 h-3 text-primary" /><span className="text-primary font-bold">Администратор</span></>
                        ) : (
                          <><User className="w-3 h-3 text-muted-foreground" /><span className="text-muted-foreground">{msg.player_name}</span></>
                        )}
                      </div>
                      <div className={cn(
                        'max-w-md px-4 py-2 rounded-xl text-sm',
                        msg.is_admin
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none'
                      )}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                      </span>
                    </motion.div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply input */}
                <div className="border-t border-border p-4 flex gap-2 shrink-0">
                  <Input
                    placeholder="Ответить..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    className="bg-muted border-border"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!reply.trim() || sendMutation.isPending}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Отправить
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </AdminAuthGate>
  );
}