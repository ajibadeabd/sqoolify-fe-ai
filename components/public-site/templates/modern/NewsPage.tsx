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
    headlineSub: heroSec?.headlineSub || heroSec?.subtitle || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
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
      {/* ═══════ HERO — SOFT GRADIENT ═══════ */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.05]" style={{ background: `radial-gradient(circle, ${pc}, transparent 70%)` }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-8">
            <span className="text-gray-600 text-sm font-medium">{hero.badge}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            {hero.headline}{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${pc}, ${pc}99)` }}>
              {hero.headlineSub}
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">{hero.description}</p>
        </div>
      </section>

      {/* ═══════ FEATURED STORY ═══════ */}
      {featured && (
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{featuredBadge}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden">
                <img src={featured.image || images.newsFallback} alt={featured.title} className="w-full h-[420px] object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-sm text-gray-400 font-medium">{featured.date}</span>
                  {featured.category && (
                    <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: `${pc}10`, color: pc }}>
                      {featured.category}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">{featured.title}</h2>
                <p className="text-gray-500 leading-relaxed text-lg">{featured.excerpt}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ALL NEWS GRID ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{gridBadge}</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">{gridHeading}</h2>
          </div>

          {others.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="overflow-hidden">
                    <img src={item.image || images.newsFallback} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-400">{item.date}</span>
                      {item.category && (
                        <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${pc}10`, color: pc }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : !featured ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{emptyTitle}</h3>
              <p className="text-gray-500 text-lg">{emptyDescription}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl px-8 py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: pc }}>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-5 whitespace-pre-line">{cta.headline}</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-10">{cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {ctaButtons.map((btn, i) => (
                  btn.variant === 'primary' ? (
                    <a key={i} href={btn.link} className="group inline-flex items-center justify-center gap-2.5 bg-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all" style={{ color: pc }}>
                      {btn.text}
                      <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <a key={i} href={btn.link} className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg text-white border border-white/20 hover:bg-white/10 transition-all">
                      {btn.text}
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
