import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SESSION_KEY = 'mw_chat_session';
const NAME_KEY = 'mw_chat_name';

function getOrCreateSession() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('name'); // 'name' | 'chat'
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const sessionId = useRef(getOrCreateSession());
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem(NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
      setStep('chat');
    }
  }, []);

  // Poll for new messages
  useEffect(() => {
    if (step !== 'chat') return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [step]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, open]);

  // Count unread admin messages when closed
  useEffect(() => {
    if (!open) {
      const adminMsgs = messages.filter(m => m.is_admin && !m.is_read);
      setUnread(adminMsgs.length);
    } else {
      setUnread(0);
      // Mark as read
      messages.forEach(m => {
        if (m.is_admin && !m.is_read) {
          base44.entities.ChatMessage.update(m.id, { is_read: true });
        }
      });
    }
  }, [messages, open]);

  const loadMessages = async () => {
    const msgs = await base44.entities.ChatMessage.filter(
      { session_id: sessionId.current },
      'created_date',
      100
    );
    setMessages(msgs);
  };

  const handleSetName = () => {
    if (!inputName.trim()) return;
    const name = inputName.trim();
    setPlayerName(name);
    localStorage.setItem(NAME_KEY, name);
    setStep('chat');
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const text = message.trim();
    setMessage('');
    await base44.entities.ChatMessage.create({
      player_name: playerName,
      message: text,
      is_admin: false,
      session_id: sessionId.current,
      is_read: false,
    });
    await loadMessages();
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      step === 'name' ? handleSetName() : handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-heading font-bold text-sm text-foreground">Чат поддержки</p>
                  <p className="text-[10px] text-muted-foreground">Администрация MartWorld</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {step === 'name' ? (
              /* Name step */
              <div className="p-6 flex flex-col gap-4 flex-1 justify-center">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-lg text-foreground">Привет!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Введи свой игровой никнейм, чтобы начать</p>
                </div>
                <Input
                  placeholder="Твой никнейм..."
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-muted border-border"
                  autoFocus
                />
                <Button onClick={handleSetName} className="bg-primary hover:bg-primary/90" disabled={!inputName.trim()}>
                  Начать чат
                </Button>
              </div>
            ) : (
              /* Chat step */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" style={{ minHeight: 0, height: '320px' }}>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Напиши свой вопрос, и мы ответим как можно скорее!</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col gap-1', msg.is_admin ? 'items-start' : 'items-end')}
                    >
                      {msg.is_admin && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-primary" />
                          <span className="text-[10px] text-primary font-bold">Администратор</span>
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[80%] px-3 py-2 rounded-xl text-sm',
                        msg.is_admin
                          ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tl-none'
                          : 'bg-muted text-foreground rounded-tr-none'
                      )}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                      </span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-3 flex gap-2">
                  <Input
                    placeholder="Сообщение..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-muted border-border flex-1 h-9"
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-primary hover:bg-primary/90 shrink-0"
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="relative w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-white animate-pulse-glow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}