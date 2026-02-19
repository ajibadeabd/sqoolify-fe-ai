import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  newsHeroContent, defaultNewsItems, newsCtaContent, images,
  type NewsItemContent,
} from '../shared/content';

export default function NewsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero')
  const textSec = getSection(sitePage, 'text')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = newsHeroContent(name)
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || images.newsHero,
  }

  const featuredBadge = textSec?.featuredBadge || 'Featured Story'
  const gridBadge = textSec?.gridBadge || 'Latest Updates'
  const gridHeading = textSec?.gridHeading || 'News & Events'
  const newsItems: NewsItemContent[] = textSec?.newsItems || defaultNewsItems
  const emptyTitle = textSec?.emptyTitle || 'No news yet'
  const emptyDescription = textSec?.emptyDescription || 'Check back soon for the latest updates and announcements.'

  const _dc = newsCtaContent(name)
  const cta = {
    headline: ctaSec?.headline || ctaSec?.title || _dc.headline,
    description: ctaSec?.description || _dc.description,
  }
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Contact School', link: '/contact', variant: 'primary' },
  ]

  const featured = newsItems[0]
  const others = newsItems.slice(1)

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED ═══════ */}
      <section className="relative min-h-[75vh] flex items-end overflow-hidden">
        <img src={hero.heroImage} alt="School news" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">{hero.badge}</span>
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-6 max-w-4xl">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed">{hero.description}</p>
        </div>
      </section>

      {/* ═══════ FEATURED STORY ═══════ */}
      {featured && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-28">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>{featuredBadge}</p>
                <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase mb-6">
                  {featured.title}
                </h2>
                <p className="text-gray-500 leading-relaxed text-lg mb-10">{featured.excerpt}</p>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{featured.date}</span>
                  {featured.category && (
                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1" style={{ backgroundColor: `${pc}20`, color: pc }}>
                      {featured.category}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <img src={featured.image || images.newsFallback} alt={featured.title} className="w-full h-[520px] object-cover" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ALL NEWS GRID ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{gridBadge}</p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase">{gridHeading}</h2>
          </div>

          {others.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
              {others.map((item) => (
                <div key={item.id} className="group bg-gray-950 p-10 hover:bg-gray-900 transition-all">
                  <div className="overflow-hidden mb-6">
                    <img src={item.image || images.newsFallback} alt={item.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">{item.date}</span>
                    {item.category && (
                      <span className="text-xs font-black uppercase tracking-widest px-3 py-1" style={{ backgroundColor: `${pc}20`, color: pc }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wide mb-3 leading-tight">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed line-clamp-3">{item.excerpt}</p>
                </div>
              ))}
            </div>
          ) : !featured ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-3">{emptyTitle}</h3>
              <p className="text-white/40 text-lg">{emptyDescription}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════ CTA — FULL-BLEED ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={images.admissionsHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((btn, i) => (
              btn.variant === 'primary' ? (
                <a key={i} href={btn.link} className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all" style={{ backgroundColor: pc, color: '#fff' }}>
                  {btn.text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a key={i} href={btn.link} className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 transition-all">
                  {btn.text}
                </a>
              )
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
