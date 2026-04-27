import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Users, Zap, Globe, Lock } from 'lucide-react';

const features = [
  { icon: Sword, title: 'PvP Арены', desc: 'Сражайся с другими игроками в захватывающих PvP боях' },
  { icon: Shield, title: 'Защита', desc: 'Продвинутая анти-чит система для честной игры' },
  { icon: Users, title: 'Сообщество', desc: 'Дружелюбное сообщество игроков и активная поддержка' },
  { icon: Zap, title: 'Производительность', desc: 'Мощный сервер с минимальным пингом и TPS 20' },
  { icon: Globe, title: 'Мини-игры', desc: 'Множество уникальных мини-игр и режимов' },
  { icon: Lock, title: 'Безопасность', desc: 'Полная безопасность аккаунтов и данных' },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Почему <span className="text-primary">MartWorld</span>?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Узнай, что делает наш сервер особенным
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-card border border-border rounded-xl p-6 group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}