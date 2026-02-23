import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  heroContent, heroStats as defaultHeroStats, pillars as defaultPillars,
  campusImages as defaultCampusImages, aboutStripContent, aboutStripStats as defaultAboutStripStats,
  featuredTestimonial as defaultFeaturedTestimonial, testimonials as defaultTestimonials,
  homeCtaContent,
} from '../shared/content';

export default function HomePage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1a5634';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero');
  const featuresSec = getSection(sitePage, 'features');
  const gallerySec = getSection(sitePage, 'gallery');
  const textSec = getSection(sitePage, 'text');
  const testimonialsSec = getSection(sitePage, 'testimonials');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = heroContent(name);
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    stats: heroSec?.stats || defaultHeroStats,
    buttons: heroSec?.buttons || [
      { text: 'Start Application', link: '/admissions', variant: 'primary' },
      { text: 'Our Story', link: '/about', variant: 'secondary' },
    ],
  };

  const features = {
    label: featuresSec?.label || `Why ${name}`,
    title: featuresSec?.title || 'An education designed for',
    titleHighlight: featuresSec?.titleHighlight || 'real-world success',
    subtitle: featuresSec?.subtitle || 'We go beyond textbooks. Every programme is built to develop critical thinkers, confident communicators, and compassionate leaders.',
    items: featuresSec?.features?.map((f: any) => ({
      title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'academic',
    })) || defaultPillars,
  };

  const gallery = {
    label: gallerySec?.label || 'Campus Life',
    title: gallerySec?.title || 'More than a school —',
    titleSub: gallerySec?.titleSub || 'a second home',
    subtitle: gallerySec?.subtitle || 'From morning assembly to after-school clubs, every moment is an opportunity to grow, connect, and discover new passions.',
    images: gallerySec?.images || {
      main: defaultCampusImages.main,
      items: [defaultCampusImages.library, defaultCampusImages.computerLab, defaultCampusImages.sports],
    },
  };

  const _da = aboutStripContent(name);
  const about = {
    label: textSec?.label || 'Our Story',
    title: textSec?.title || 'Building a legacy of excellence',
    titleHighlight: textSec?.titleHighlight || 'since day one',
    para1: textSec?.para1 || textSec?.content || _da.para1,
    para2: textSec?.para2 || _da.para2,
    stats: textSec?.stats || defaultAboutStripStats,
    link: textSec?.link || { text: 'Read our full story', href: '/about' },
  };

  const _ft = testimonialsSec?.testimonials?.[0];
  const featuredTestimonial = _ft
    ? { name: _ft.name, role: _ft.role || '', initials: _ft.initials || _ft.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: _ft.quote || _ft.content || '' }
    : defaultFeaturedTestimonial;
  const tMeta = {
    label: testimonialsSec?.label || 'Testimonials',
    title: testimonialsSec?.title || 'Trusted by families',
    titleSub: testimonialsSec?.titleSub || 'across the community',
  };
  const testimonials = testimonialsSec?.testimonials?.slice(1).map((t: any) => ({
    name: t.name, role: t.role || '', initials: t.initials || t.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: t.quote || t.content || '',
  })) || defaultTestimonials;

  const _dc = homeCtaContent(name);
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
    buttons: ctaSec?.buttons || [
      { text: 'Begin Application', link: '/admissions', variant: 'primary' },
      { text: 'Talk to Admissions', link: '/contact', variant: 'secondary' },
    ],
  };

  const galleryImages = [
    gallery.images.main,
    ...(gallery.images.items || []),
  ];

  return (
    <>
      {/* ═══════ HERO — EDITORIAL COVER ═══════ */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-black">
        <img
          src={gallery.images.main?.src || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80'}
          alt="School campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-24 pt-40">
          <div className="max-w-4xl">
            <span
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 mb-8"
              style={{ backgroundColor: `${pc}20`, color: 'white' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">{hero.badge}</span>
            </span>

            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-white mb-6">
              {hero.headline}
              <span className="block text-white/60">{hero.headlineSub}</span>
            </h1>

            <p className="text-xl text-white/50 max-w-2xl leading-relaxed mb-10">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              {hero.buttons[0] && (
                <a
                  href={hero.buttons[0].link}
                  className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                  style={{ color: pc }}
                >
                  {hero.buttons[0].text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              {hero.buttons[1] && (
                <a
                  href={hero.buttons[1].link}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  {hero.buttons[1].text}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS STRIP — LIGHT (FIX #2: no dark bg-gray-950) ═══════ */}
      <section className="bg-white border-b border-gray-100 px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {hero.stats.map((s: any) => (
              <div key={s.label} className="text-center p-6 rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-black tracking-tight" style={{ color: pc }}>{s.val}</div>
                <div className="text-sm text-gray-500 font-medium mt-2 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PILLARS — FEATURES ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {features.label}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
              {features.title}<br className="hidden sm:block" />
              <span style={{ color: pc }}>{features.titleHighlight}</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">{features.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.items.map((f: any) => (
              <div
                key={f.title}
                className="group relative bg-gray-50 rounded-[2.5rem] p-8 lg:p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ backgroundColor: pc }}
                >
                  <Icon name={f.iconName} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAMPUS GALLERY — HORIZONTAL SCROLL + INDICATOR (FIX #3) ═══════ */}
      <section className="py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}20` }}>
                {gallery.label}
              </span>
              <h2 className="text-4xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.1]">
                {gallery.title}<br />{gallery.titleSub}
              </h2>
            </div>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed shrink-0">{gallery.subtitle}</p>
          </div>
        </div>

        {/* Horizontal scroll container with right-side gradient fade */}
        <div className="relative">
          <div className="flex gap-5 overflow-x-auto pb-4 pl-6 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {galleryImages.map((img: any, i: number) => (
              <div
                key={i}
                className="shrink-0 w-72 lg:w-80 h-[420px] rounded-[2.5rem] overflow-hidden relative group snap-start"
              >
                <img
                  src={img?.src || img}
                  alt={img?.alt || img?.label || 'Campus'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {img?.label && (
                  <div className="absolute bottom-5 left-5">
                    {img.tag && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: pc }}>{img.tag}</span>
                    )}
                    <div className="text-base font-bold text-white">{img.label}</div>
                  </div>
                )}
              </div>
            ))}
            {/* Spacer so last card isn't edge-clipped */}
            <div className="shrink-0 w-6 pr-6" />
          </div>

          {/* Right gradient fade — discoverability cue */}
          <div className="absolute right-0 top-0 bottom-4 w-40 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
        </div>

        {/* Scroll indicator */}
        <div className="max-w-7xl mx-auto px-6 mt-5">
          <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
            Scroll to explore
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </div>
      </section>

      {/* ═══════ ABOUT STRIP — EDITORIAL SPLIT ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"
                  alt="Students learning"
                  className="w-full h-[460px] object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-3 lg:pl-8">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}10` }}>
                {about.label}
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-gray-900 tracking-tight leading-[1.15] mb-6">
                {about.title}<br className="hidden lg:block" />
                <span style={{ color: pc }}>{about.titleHighlight}</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">{about.para1}</p>
              <p className="text-gray-400 leading-relaxed mb-10">{about.para2}</p>

              <div className="grid grid-cols-3 gap-6 p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                {about.stats.map((s: any) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-black tracking-tight" style={{ color: pc }}>{s.val}</div>
                    <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a
                href={about.link.href}
                className="group inline-flex items-center gap-2 mt-8 font-bold text-lg hover:gap-3 transition-all duration-300"
                style={{ color: pc }}
              >
                {about.link.text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="px-6 py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {tMeta.label}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1]">
              {tMeta.title}<br />{tMeta.titleSub}
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:row-span-2 rounded-[2.5rem] p-10 lg:p-12 text-white relative overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.06] bg-white" />
              </div>
              <div className="relative">
                <div className="text-8xl font-serif leading-none opacity-20 mb-4">"</div>
                <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-10 -mt-8">
                  {featuredTestimonial.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    {featuredTestimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{featuredTestimonial.name}</div>
                    <div className="text-white/60 text-sm">{featuredTestimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>

            {testimonials.map((t: any, i: number) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA — HIGH CONVERSION STRIP (FIX #1: colored bg + dot pattern) ═══════ */}
      <section className="relative px-6 py-36 overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] bg-white" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05] bg-white" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-5 py-2 mb-6 rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-white">
            {cta.badge}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6 whitespace-pre-line">
            {cta.headline}
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            {cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {cta.buttons[0] && (
              <a
                href={cta.buttons[0].link}
                className="group inline-flex items-center justify-center gap-3 bg-white px-12 py-5 rounded-2xl text-lg font-black hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all"
                style={{ color: pc }}
              >
                {cta.buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {cta.buttons[1] && (
              <a
                href={cta.buttons[1].link}
                className="inline-flex items-center justify-center px-12 py-5 rounded-2xl text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {cta.buttons[1].text}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
