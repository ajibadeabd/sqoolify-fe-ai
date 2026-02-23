import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  newsHeroContent, defaultNewsItems, newsCtaContent, images,
  type NewsItemContent,
} from '../shared/content';

export default function NewsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#23b864';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero');
  const textSec = getSection(sitePage, 'text');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = newsHeroContent(name);
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || images.newsHero,
  };

  const featuredBadge = textSec?.featuredBadge || 'Featured Story';
  const gridBadge = textSec?.gridBadge || 'Latest Updates';
  const gridHeading = textSec?.gridHeading || 'News & Announcements';

  const newsItems: NewsItemContent[] = textSec?.newsItems || defaultNewsItems;

  const emptyTitle = textSec?.emptyTitle || 'No updates yet';
  const emptyDescription = textSec?.emptyDescription || 'We are preparing something special. Please check back soon.';

  const _dc = newsCtaContent(name);
  const cta = {
    badge: ctaSec?.badge || 'Admissions Open',
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };
  const ctaButtons = ctaSec?.buttons || [
    { text: 'Apply Now', link: '/admissions', variant: 'primary' },
    { text: 'Contact School', link: '/contact', variant: 'secondary' },
  ];

  const featured = newsItems[0];
  const others = newsItems.slice(1);

  return (
    <>
      {/* ═══════ HERO — SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] overflow-hidden">
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-16 lg:py-0">
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />
          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>05 / News</span>
            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed">{hero.description}</p>
          </div>
        </div>
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img src={hero.heroImage} alt="School news" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
          {featured && (
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 block">{featuredBadge}</span>
                <p className="text-white font-bold text-sm leading-snug line-clamp-2">{featured.title}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ FEATURED STORY ═══════ */}
      {featured && (
        <section className="bg-white px-6 py-28">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{featuredBadge}</span>
            </div>
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7 relative">
                <div className="overflow-hidden">
                  <img
                    src={featured.image || images.newsFallback}
                    alt={featured.title}
                    className="w-full h-[480px] object-cover"
                  />
                </div>
                <div className="absolute top-0 right-0 w-full h-full border-2 -translate-x-3 translate-y-3 pointer-events-none" style={{ borderColor: `${pc}30` }} />
              </div>

              <div className="lg:col-span-5 lg:pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm text-gray-400 font-medium">{featured.date}</span>
                  {featured.category && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5" style={{ color: pc, borderBottom: `2px solid ${pc}` }}>
                      {featured.category}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black tracking-tighter leading-[1.05] text-gray-950 mb-6">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-10">{featured.excerpt}</p>
                <a
                  href={`/news/${(featured as any).slug || featured.id}`}
                  className="group inline-flex items-center gap-3 font-bold text-lg"
                  style={{ color: pc }}
                >
                  Read full story
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ ALL NEWS — BORDERED GRID ═══════ */}
      <section className="bg-gray-50 px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{gridBadge}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter">{gridHeading}</h2>
          </div>

          {others.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 border border-gray-200">
              {others.map((item, i) => (
                <a
                  key={item.id}
                  href={`/news/${(item as any).slug || item.id}`}
                  className={`group bg-white hover:bg-gray-50 transition-all duration-300 overflow-hidden ${i % 3 < 2 ? 'border-r border-gray-200' : ''} ${Math.floor(i / 3) < Math.floor((others.length - 1) / 3) ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={item.image || images.newsFallback}
                      alt={item.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400">{item.date}</span>
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pc }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight leading-snug group-hover:text-gray-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{item.excerpt}</p>
                    <span className="inline-flex items-center gap-2 mt-5 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: pc }}>
                      Read more <Icon name="arrowRight" className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : !featured ? (
            <div className="text-center py-24 border border-gray-200">
              <p
                className="font-black leading-none mb-6 select-none"
                style={{ fontSize: '6rem', WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}
              >
                Soon
              </p>
              <h3 className="text-2xl font-black text-gray-900 mb-3">{emptyTitle}</h3>
              <p className="text-gray-400 text-lg">{emptyDescription}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════ CTA — 50/50 ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[35vh]">
        <div className="w-full lg:w-1/2 flex items-center py-24 px-8 sm:px-12 lg:px-20 bg-white border-t border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-5 block" style={{ color: pc }}>{cta.badge}</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter leading-[1.0] mb-6 whitespace-pre-line">{cta.headline}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">{cta.description}</p>
            <div className="flex flex-wrap gap-4">
              {ctaButtons.map((btn: any, i: number) =>
                btn.variant === 'primary' ? (
                  <a key={i} href={btn.link} className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg" style={{ backgroundColor: pc }}>
                    {btn.text}<Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <a key={i} href={btn.link} className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all">
                    {btn.text}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center py-20 px-8 relative overflow-hidden" style={{ backgroundColor: pc }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative text-center">
            <p className="text-white/60 text-sm uppercase tracking-widest">Stay in the loop</p>
          </div>
        </div>
      </section>
    </>
  );
}
