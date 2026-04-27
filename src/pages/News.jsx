import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const categoryLabels = {
  update: 'Обновление',
  event: 'Событие',
  maintenance: 'Тех. работы',
  announcement: 'Объявление',
};

const categoryColors = {
  update: 'bg-green-500/20 text-green-400 border-green-500/30',
  event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  announcement: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function News() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => base44.entities.NewsPost.list('-created_date', 50),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading font-bold text-4xl text-foreground text-center mb-12"
        >
          Новости
        </motion.h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Новостей пока нет</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-card border-border p-6 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.pinned && <Pin className="w-4 h-4 text-primary" />}
                      <h2 className="font-heading font-bold text-lg text-foreground">{post.title}</h2>
                    </div>
                    <Badge className={`${categoryColors[post.category] || categoryColors.announcement} shrink-0`}>
                      {categoryLabels[post.category] || 'Объявление'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {post.created_date ? format(new Date(post.created_date), 'dd.MM.yyyy HH:mm') : ''}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}