import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { safeHex } from '@/utils/color';
import type { StorageBucket } from '@/services/storage';
import type { CongressType } from '@/types/CongressType';
import type { BannerTypes } from '@/types/BannerTypes';

const BRAND = '#E51C44';
const BRAND_DARK = '#B0143A';

export interface HeroCta {
  label: string;
  route: string;
}

export interface HeroSlide {
  id: string;
  kind: 'congress' | 'banner';
  /** Caminho bruto do Storage (DirectusImage resolve a URL). */
  image: string | null;
  bucket: StorageBucket;
  eyebrow?: string;
  title: string;
  theme?: string;
  dateRange?: string;
  primaryColor: string;
  secondColor: string;
  statusHospedagem?: boolean;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
}

/** Intervalo de datas em pt-BR (ex.: "12 – 15 de out. 2026"). */
function formatDateRange(start?: Date | string, end?: Date | string): string | undefined {
  if (!start) return undefined;
  const s = new Date(start);
  if (isNaN(s.getTime())) return undefined;
  const e = end ? new Date(end) : null;
  if (!e || isNaN(e.getTime())) return format(s, "dd 'de' MMM',' yyyy", { locale: ptBR });
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth
    ? `${format(s, 'dd')} – ${format(e, "dd 'de' MMM',' yyyy", { locale: ptBR })}`
    : `${format(s, "dd 'de' MMM", { locale: ptBR })} – ${format(e, "dd 'de' MMM',' yyyy", { locale: ptBR })}`;
}

/**
 * Normaliza congressos + banners em uma única lista de slides do hero.
 * Com os dados reais (1 congresso + 2 banners) rende 3 slides -> o topo lê
 * mais denso do que um único card de congresso.
 */
export function buildHeroSlides(
  congressos: CongressType[] = [],
  banners: BannerTypes[] = [],
): HeroSlide[] {
  const congressSlides: HeroSlide[] = (congressos ?? []).map((c) => {
    const year = c.date_start ? new Date(c.date_start).getFullYear() : undefined;
    return {
      id: `congress-${c.id}`,
      kind: 'congress',
      image: c.poster || null,
      bucket: 'images',
      eyebrow: year ? `CONGRESSO ${year}` : 'CONGRESSO',
      title: c.name,
      theme: c.theme || undefined,
      dateRange: formatDateRange(c.date_start, c.date_end),
      primaryColor: safeHex(c.primary_color, BRAND),
      secondColor: safeHex(c.second_color, BRAND_DARK),
      statusHospedagem: !!c.status_hospedagem,
      primaryCta: { label: 'Acessar', route: `/(tabs)/(home)/(congresso)/${c.id}` },
      secondaryCta: c.status_hospedagem
        ? { label: 'Hospedagem', route: '/(tabs)/(home)/(congresso)/hospedagem' }
        : { label: 'Cartão de acesso', route: '/(tabs)/(home)/(congresso)/cartao-acesso' },
    };
  });

  const bannerSlides: HeroSlide[] = (banners ?? [])
    .filter((b) => b.image)
    .map((b) => ({
      id: `banner-${b.id}`,
      kind: 'banner' as const,
      image: b.image,
      bucket: 'images' as StorageBucket,
      eyebrow: 'DESTAQUE',
      title: b.title || 'Destaque',
      theme: b.description || undefined,
      primaryColor: BRAND,
      secondColor: BRAND_DARK,
      primaryCta: { label: b.action_label || 'Saiba mais', route: b.page_route || '/(tabs)/(home)' },
    }));

  return [...congressSlides, ...bannerSlides];
}
