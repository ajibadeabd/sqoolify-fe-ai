import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  newsHeroContent, defaultNewsItems, newsCtaContent, images,
  type NewsItemContent,
} from '../shared/content';

export default function NewsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1a5634';
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
    badge: ctaSec?.badge || ctaSec?.title || _dc.headline,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  }
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Contact School', link: '/contact', variant: 'primary' },
    { text: 'View Admissions', link: '/admissions', variant: 'secondary' },
  ]

  const featured = newsItems[0]
  const others = newsItems.slice(1)

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0">
          <img src={hero.heroImage} alt="School news" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05] bg-white" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">{hero.badge}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {hero.headline}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">{hero.headlineSub}</span>
            </h1>
            <p className="text-xl text-white/50 max-w-lg leading-relaxed">{hero.description}</p>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED STORY ═══════ */}
      {featured && (
        <section className="px-6 py-28 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
                {featuredBadge}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="rounded-3xl overflow-hidden">
                <img src={featured.image || images.newsFallback} alt={featured.title} className="w-full h-[480px] object-cover" />
              </div>
              <div className="flex flex-col justify-center p-4 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-gray-400 font-medium">{featured.date}</span>
                  {featured.category && (
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ color: pc, backgroundColor: `${pc}10` }}>
                      {featured.category}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-[2.8rem] font-black text-gray-900 tracking-tight leading-[1.1] mb-6">{featured.title}</h2>
                <p className="text-gray-500 leading-relaxed text-lg">{featured.excerpt}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ALL NEWS GRID ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}20` }}>
              {gridBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.1]">
              {gridHeading}
            </h2>
          </div>

          {others.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((item) => (
                <div key={item.id} className="group bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="overflow-hidden">
                    <img src={item.image || images.newsFallback} alt={item.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-gray-500">{item.date}</span>
                      {item.category && (
                        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: pc, backgroundColor: `${pc}20` }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-3 tracking-tight leading-tight">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed line-clamp-3">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : !featured ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-black text-white mb-3">{emptyTitle}</h3>
              <p className="text-gray-400 text-lg">{emptyDescription}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((btn, i) => (
              btn.variant === 'primary' ? (
                <a key={i} href={btn.link} className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300" style={{ color: pc }}>
                  {btn.text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a key={i} href={btn.link} className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
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
