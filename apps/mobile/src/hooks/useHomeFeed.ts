import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { getItems } from '@/services/items';
import { getLeadership } from '@/services/user';
import { newsService } from '@/services/news';
import { getStorageUrl } from '@/services/storage';
import type { CongressType } from '@/types/CongressType';
import type { EventsTypes } from '@/types/EventsTypes';
import type { NewsTypes } from '@/types/NewsTypes';
import type { UserTypes } from '@/types/UserTypes';
import { buildHeroSlides, type HeroSlide } from '@/components/organisms/HomeHero/buildHeroSlides';
import type { HomeBanner } from '@/components/organisms/HomeBanner';

export type SectionStatus = 'loading' | 'ready' | 'empty' | 'error';
export interface Slice<T> {
  data: T;
  status: SectionStatus;
}

const emptySlice = <T,>(d: T): Slice<T> => ({ data: d, status: 'loading' });
const statusFor = (len: number): SectionStatus => (len ? 'ready' : 'empty');

/**
 * Cérebro de dados único da home (SRP): dispara todas as fontes em paralelo com
 * Promise.allSettled (uma fonte lenta/quebrada nunca bloqueia as outras),
 * mantém status por seção, deriva os slides do hero e faz prefetch das imagens
 * mais visíveis. Substitui os fetches espalhados em InfoCongressCarousel/
 * BannerCarousel/BannerCarouselUsers/AvatarGroup.
 */
export function useHomeFeed() {
  const [congressos, setCongressos] = useState<CongressType[]>([]);
  const [heroStatus, setHeroStatus] = useState<SectionStatus>('loading');
  const [events, setEvents] = useState<Slice<EventsTypes[]>>(emptySlice([]));
  const [news, setNews] = useState<Slice<NewsTypes[]>>(emptySlice([]));
  const [leadership, setLeadership] = useState<Slice<UserTypes[]>>(emptySlice([]));
  const [banners, setBanners] = useState<Slice<HomeBanner[]>>(emptySlice([]));
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [c, e, n, p, b] = await Promise.allSettled([
      getItems<CongressType[]>('congressos', { sort: ['-date_start'] }),
      // "Próximos eventos": só os futuros (ordenados do mais próximo ao mais distante).
      getItems<EventsTypes[]>('events', {
        sort: ['start_date_time'],
        filter: { start_date_time: { _gte: new Date().toISOString() } },
        limit: 12,
      }),
      newsService.getNews({ page: 1, limit: 10 }),
      getLeadership(12),
      // Banner promocional (acima do "Acesso rápido") — só publicados (a RLS de banners
      // exige status='published'), ordenados por `sort`.
      getItems<HomeBanner[]>('banners', { sort: ['sort'], filter: { status: { _eq: 'published' } }, limit: 5 }),
    ]);

    // O hero (banner cartaz) exibe SOMENTE congressos — banners não entram mais no topo.
    const congressData = c.status === 'fulfilled' ? c.value ?? [] : [];
    setCongressos(congressData);
    setHeroStatus(c.status === 'rejected' ? 'error' : statusFor(congressData.length));

    const eventData = e.status === 'fulfilled' ? e.value ?? [] : [];
    setEvents({ data: eventData, status: e.status === 'rejected' ? 'error' : statusFor(eventData.length) });

    const newsData = n.status === 'fulfilled' ? n.value?.data ?? [] : [];
    setNews({ data: newsData, status: n.status === 'rejected' ? 'error' : statusFor(newsData.length) });

    const leaders = p.status === 'fulfilled' ? p.value ?? [] : [];
    setLeadership({ data: leaders, status: p.status === 'rejected' ? 'error' : statusFor(leaders.length) });

    const bannerData = b.status === 'fulfilled' ? b.value ?? [] : [];
    setBanners({ data: bannerData, status: b.status === 'rejected' ? 'error' : statusFor(bannerData.length) });

    // Aquece as imagens do topo (hero + banner + primeiros eventos) para pintura instantânea.
    const urls = [
      ...buildHeroSlides(congressData).slice(0, 2).map((s) => getStorageUrl(s.image, 'images')),
      ...bannerData.slice(0, 1).map((bn) => getStorageUrl(bn.image, 'images')),
      ...eventData.slice(0, 3).map((ev) => getStorageUrl(ev.image_cover, 'images')),
    ].filter(Boolean) as string[];
    if (urls.length) ExpoImage.prefetch(urls).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const heroSlides: HeroSlide[] = useMemo(
    () => buildHeroSlides(congressos),
    [congressos],
  );

  return { heroSlides, heroStatus, banners, events, news, leadership, refreshing, reload };
}
