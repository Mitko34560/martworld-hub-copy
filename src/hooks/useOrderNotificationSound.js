import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

function playNotificationSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const times = [0, 0.18, 0.36];
  times.forEach((startTime) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime + startTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + startTime + 0.12);

    gain.gain.setValueAtTime(0.4, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.14);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + 0.15);
  });
}

export function useOrderNotificationSound() {
  const knownIds = useRef(null);

  useEffect(() => {
    const unsubscribe = base44.entities.ShopOrder.subscribe((event) => {
      if (event.type === 'create' && event.data?.status === 'pending') {
        // First load: populate known IDs without playing sound
        if (knownIds.current === null) return;
        if (!knownIds.current.has(event.id)) {
          knownIds.current.add(event.id);
          playNotificationSound();
        }
      }
    });

    // Fetch current pending orders to seed knownIds
    base44.entities.ShopOrder.filter({ status: 'pending' }).then((orders) => {
      knownIds.current = new Set(orders.map((o) => o.id));
    });

    return unsubscribe;
  }, []);
}