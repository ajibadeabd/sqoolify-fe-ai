import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  newsHeroContent,
  defaultNewsItems,
  newsCtaContent,
  images,
  type NewsItemContent,
} from '../shared/content';

export default function NewsPage({
  school,
  sitePage,
}: {
  school: PublicSchool;
  sitePage?: SitePage;
}) {
  const pc = school.siteConfig?.primaryColor || '#1a5634';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero');
  const textSec = getSection(sitePage, 'text');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = newsHeroContent(name);
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description:
      heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || images.newsHero,
  };

  const featuredBadge =
    textSec?.featuredBadge || 'Featured Story';
  const gridBadge = textSec?.gridBadge || 'Latest Updates';
  const gridHeading =
    textSec?.gridHeading || 'News & Announcements';

  const newsItems: NewsItemContent[] =
    textSec?.newsItems || defaultNewsItems;

  const emptyTitle =
    textSec?.emptyTitle || 'No updates yet';
  const emptyDescription =
    textSec?.emptyDescription ||
    'We are preparing something special. Please check back soon.';

  const _dc = newsCtaContent(name);
  const cta = {
    badge: ctaSec?.badge || 'Admissions Open',
    headline: ctaSec?.headline || _dc.headline,
    description:
      ctaSec?.description || _dc.description,
  };

  const ctaButtons =
    ctaSec?.buttons || [
      {
        text: 'Apply Now',
        link: '/admissions',
        variant: 'primary',
      },
      {
        text: 'Contact School',
        link: '/contact',
        variant: 'secondary',
      },
    ];

  const featured = newsItems[0];
  const others = newsItems.slice(1);

  return (
    <>
      {/* HERO — EDITORIAL COVER */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-black">
        <img
          src={hero.heroImage}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />

        <div className="relative max-w-7xl mx-auto px-6 pb-24 pt-40">
          <div className="max-w-4xl">
            <span
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 mb-8"
              style={{
                backgroundColor: `${pc}20`,
                color: 'white',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">
                {hero.badge}
              </span>
            </span>

            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-white mb-6">
              {hero.headline}
              <span className="block text-white/60">
                {hero.headlineSub}
              </span>
            </h1>

            <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
              {hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED STORY — MAGAZINE LAYOUT */}
      {featured && (
        <section className="bg-white px-6 py-28">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  src={featured.image || images.newsFallback}
                  alt={featured.title}
                  className="w-full h-[520px] object-cover"
                />
              </div>
              <span
                className="absolute top-6 left-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
                style={{
                  backgroundColor: pc,
                  color: 'white',
                }}
              >
                {featuredBadge}
              </span>
            </div>

            <div className="lg:col-span-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-400 font-medium">
                  {featured.date}
                </span>
                {featured.category && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                    style={{
                      color: pc,
                      backgroundColor: `${pc}10`,
                    }}
                  >
                    {featured.category}
                  </span>
                )}
              </div>

              <h2 className="text-4xl lg:text-[3.2rem] font-black tracking-tight leading-[1.05] mb-6">
                {featured.title}
              </h2>

              <p className="text-gray-500 text-lg leading-relaxed mb-10">
                {featured.excerpt}
              </p>

              <a
                href={`/news/${(featured as any).slug || featured.id}`}
                className="group inline-flex items-center gap-3 font-bold text-lg"
                style={{ color: pc }}
              >
                Read full story
                <Icon
                  name="arrowRight"
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ALL NEWS — EDITORIAL GRID */}
      <section className="bg-gray-950 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                color: pc,
                backgroundColor: `${pc}20`,
              }}
            >
              {gridBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.4rem] font-black text-white tracking-tight leading-[1.05]">
              {gridHeading}
            </h2>
          </div>

          {others.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((item) => (
                <a
                  key={item.id}
                  href={`/news/${(item as any).slug || item.id}`}
                  className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="overflow-hidden">
                    <img
                      src={
                        item.image ||
                        images.newsFallback
                      }
                      alt={item.title}
                      className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400">
                        {item.date}
                      </span>
                      {item.category && (
                        <span
                          className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                          style={{
                            color: pc,
                            backgroundColor: `${pc}20`,
                          }}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-white mb-3 tracking-tight leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : !featured ? (
            <div className="text-center py-24">
              <h3 className="text-3xl font-black text-white mb-4">
                {emptyTitle}
              </h3>
              <p className="text-gray-400 text-lg">
                {emptyDescription}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA — HIGH CONVERSION STRIP */}
      <section
        className="relative px-6 py-36 overflow-hidden"
        style={{ backgroundColor: pc }}
      >
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:32px_32px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-5 py-2 mb-6 rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-white">
            {cta.badge}
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6">
            {cta.headline}
          </h2>

          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            {cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((btn, i) =>
              btn.variant === 'primary' ? (
                <a
                  key={i}
                  href={btn.link}
                  className="group inline-flex items-center justify-center gap-3 bg-white px-12 py-5 rounded-2xl text-lg font-black hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all"
                  style={{ color: pc }}
                >
                  {btn.text}
                  <Icon
                    name="arrowRight"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  />
                </a>
              ) : (
                <a
                  key={i}
                  href={btn.link}
                  className="inline-flex items-center justify-center px-12 py-5 rounded-2xl text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
                >
                  {btn.text}
                </a>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
