import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
// Only mounted feed cards, at least 50% visible for one second in an active tab.
export function useFeedMetrics(enabled: boolean) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = container.current;
    if (!root || !enabled) return;
    let queue: { postId: string; kind: 'IMPRESSION' | 'OPEN' }[] = [];
    const seen = new Set<string>();
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const add = (postId: string, kind: 'IMPRESSION' | 'OPEN') => {
      if (!seen.has(`${postId}:${kind}`) && document.visibilityState === 'visible') {
        seen.add(`${postId}:${kind}`); queue.push({ postId, kind });
      }
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      clearTimeout(timers.get(entry.target));
      if (entry.intersectionRatio >= .5) timers.set(entry.target, setTimeout(() => {
        const id = (entry.target as HTMLElement).dataset.feedPost;
        if (id) add(id, 'IMPRESSION');
      }, 1000));
    }), { threshold: .5 });
    const observed = new WeakSet<Element>();
    const observe = () => root.querySelectorAll('[data-feed-post]').forEach(el => { if (!observed.has(el)) { observed.add(el); observer.observe(el); } });
    const mutation = new MutationObserver(observe); mutation.observe(root, { childList: true, subtree: true }); observe();
    const visibility = () => { if (document.hidden) { timers.forEach(clearTimeout); timers.clear(); } else { observer.disconnect(); root.querySelectorAll('[data-feed-post]').forEach(el => observer.observe(el)); } };
    const click = (event: MouseEvent) => {
      const target = event.target as Element;
      const link = target.closest<HTMLAnchorElement>('a[href]');
      const id = target.closest<HTMLElement>('[data-feed-post]')?.dataset.feedPost;
      if (id && link && new URL(link.href).pathname === `/posts/${id}`) {
        add(id, 'OPEN');
        if (queue.length) { const events = queue.splice(0, 20); void api('/recommendations/events', { method: 'POST', body: JSON.stringify({ events }) }).catch(() => {}); }
      }
    };
    root.addEventListener('click', click); document.addEventListener('visibilitychange', visibility);
    const flush = setInterval(() => { if (queue.length) { const events = queue.splice(0, 20); void api('/recommendations/events', { method: 'POST', body: JSON.stringify({ events }) }).catch(() => {}); } }, 5000);
    return () => { clearInterval(flush); timers.forEach(clearTimeout); observer.disconnect(); mutation.disconnect(); root.removeEventListener('click', click); document.removeEventListener('visibilitychange', visibility); queue = []; };
  }, [enabled]);
  return container;
}
