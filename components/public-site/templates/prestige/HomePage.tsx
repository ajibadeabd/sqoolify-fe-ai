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
  const pc = school.siteConfig?.primaryColor || '#23b864';
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
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
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
    image: textSec?.image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    pullQuote: textSec?.pullQuote || `"${name} shaped who I am — not just academically, but as a person."`,
    pullQuoteAuthor: textSec?.pullQuoteAuthor || 'Class of 2019 Alumna',
  };

  const _ft = testimonialsSec?.testimonials?.[0];
  const featuredTestimonial = _ft
    ? { name: _ft.name, role: _ft.role || '', initials: _ft.initials || _ft.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: _ft.quote || _ft.content || '' }
    : defaultFeaturedTestimonial;
  const tMeta = {
    label: testimonialsSec?.label || 'What Families Say',
    title: testimonialsSec?.title || 'Trusted by families across the community',
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

  return (
    <>
      {/* ═══════ HERO — VERTICAL SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-screen overflow-hidden">
        {/* Left: white panel */}
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-36 lg:py-0">
          {/* Left accent rule */}
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />

          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>
              {hero.badge}
            </span>

            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-12">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              {hero.buttons[0] && (
                <a
                  href={hero.buttons[0].link}
                  className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg"
                  style={{ backgroundColor: pc }}
                >
                  {hero.buttons[0].text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              {hero.buttons[1] && (
                <a
                  href={hero.buttons[1].link}
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold text-base rounded-xl hover:border-gray-400 hover:text-gray-900 transition-all duration-300"
                >
                  {hero.buttons[1].text}
                </a>
              )}
            </div>
          </div>

          {/* Stats strip — pinned to bottom */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 grid grid-cols-4 hidden lg:grid">
            {hero.stats.map((s: any, i: number) => (
              <div key={s.label} className={`py-5 px-6 ${i < hero.stats.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <div className="text-2xl font-black text-gray-950 tracking-tight">{s.val}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: full-height photo */}
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img
            src={hero.heroImage}
            alt="School campus"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {/* Top-left accent corner */}
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
        </div>
      </section>

      {/* ═══════ OUTLINED STATS — PREMIUM NUMBERS ═══════ */}
      <section className="bg-white py-24 border-y border-gray-100 lg:hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {hero.stats.map((s: any) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black tracking-tight" style={{ color: pc }}>{s.val}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ WHY US — NUMBERED PILLARS ═══════ */}
      <section className="bg-white py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header with number */}
          <div className="flex items-start gap-12 mb-20">
            <div className="hidden lg:block shrink-0">
              <span
                className="text-[8rem] font-black leading-none select-none"
                style={{ WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}
              >
                01
              </span>
            </div>
            <div className="pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>
                {features.label}
              </span>
              <h2 className="text-4xl lg:text-[3.5rem] font-black text-gray-950 tracking-tighter leading-[1.0] mb-5">
                {features.title}<br />
                <span style={{ color: pc }}>{features.titleHighlight}</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">{features.subtitle}</p>
            </div>
          </div>

          {/* Numbered feature list */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gray-100">
            {features.items.map((f: any, i: number) => (
              <div
                key={f.title}
                className="group p-10 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50 transition-colors duration-300 relative overflow-hidden"
              >
                {/* Background number */}
                <div
                  className="absolute top-4 right-5 text-[5rem] font-black leading-none select-none opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.07]"
                  style={{ color: pc }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: pc }}
                >
                  <Icon name={f.iconName} className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAMPUS LIFE — ASYMMETRIC GALLERY ═══════ */}
      <section className="bg-gray-50 py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-12 mb-16">
            <div className="hidden lg:block shrink-0">
              <span
                className="text-[8rem] font-black leading-none select-none"
                style={{ WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}
              >
                02
              </span>
            </div>
            <div className="pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>
                {gallery.label}
              </span>
              <h2 className="text-4xl lg:text-[3.5rem] font-black text-gray-950 tracking-tighter leading-[1.0]">
                {gallery.title}<br />
                <span style={{ color: pc }}>{gallery.titleSub}</span>
              </h2>
            </div>
          </div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ gridTemplateRows: 'auto auto' }}>
            {/* Large portrait — spans 2 rows */}
            <div className="col-span-2 lg:row-span-2 relative rounded-2xl overflow-hidden" style={{ minHeight: '480px' }}>
              <img
                src={gallery.images.main?.src || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'}
                alt={gallery.images.main?.alt || 'Campus'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ minHeight: '480px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                {gallery.images.main?.tag && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: pc }}>
                    {gallery.images.main.tag}
                  </span>
                )}
                <div className="text-lg font-bold text-white">{gallery.images.main?.label}</div>
              </div>
            </div>

            {/* Secondary images */}
            {(gallery.images.items || []).slice(0, 2).map((img: any, i: number) => (
              <div key={i} className="relative rounded-2xl overflow-hidden" style={{ minHeight: '230px' }}>
                <img
                  src={img?.src || img}
                  alt={img?.alt || img?.label || 'Campus'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  style={{ minHeight: '230px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-sm font-bold text-white">{img?.label}</div>
              </div>
            ))}

            {/* Primary color accent panel */}
            <div className="relative rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: pc, minHeight: '230px' }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="relative">
                <div className="text-5xl font-black text-white mb-1">15+</div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-widest">Clubs & Activities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT STRIP ═══════ */}
      <section className="bg-white py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img src={about.image} alt="Students" className="w-full h-full object-cover" />
              </div>
              {/* Offset border accent */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 pointer-events-none" style={{ borderColor: `${pc}40` }} />
            </div>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="hidden lg:block">
                  <span
                    className="text-[6rem] font-black leading-none select-none"
                    style={{ WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}
                  >
                    03
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.35em] block" style={{ color: pc }}>
                    {about.label}
                  </span>
                </div>
              </div>

              <h2 className="text-3xl lg:text-[2.8rem] font-black text-gray-950 tracking-tighter leading-[1.05] mb-6">
                {about.title}<br />
                <span style={{ color: pc }}>{about.titleHighlight}</span>
              </h2>

              <p className="text-gray-500 text-lg leading-relaxed mb-6">{about.para1}</p>
              <p className="text-gray-400 leading-relaxed mb-10">{about.para2}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100 mb-8">
                {about.stats.map((s: any) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-black tracking-tight" style={{ color: pc }}>{s.val}</div>
                    <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a
                href={about.link.href}
                className="group inline-flex items-center gap-2 font-bold text-base hover:gap-3 transition-all duration-300"
                style={{ color: pc }}
              >
                {about.link.text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Pull quote — full width below */}
          <div className="mt-24 pt-16 border-t border-gray-100 relative">
            <div
              className="absolute top-10 left-0 text-[12rem] font-serif leading-none opacity-[0.05] select-none"
              style={{ color: pc }}
            >
              "
            </div>
            <div className="relative max-w-3xl">
              <p className="text-2xl lg:text-3xl font-bold text-gray-800 leading-[1.4] tracking-tight mb-6">
                {about.pullQuote}
              </p>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{about.pullQuoteAuthor}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS — TYPOGRAPHIC CENTER ═══════ */}
      <section className="bg-gray-50 py-32 lg:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 relative">
            {/* Giant bg quote mark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ color: pc }}
            >
              <span className="text-[28rem] font-serif leading-none opacity-[0.04]">"</span>
            </div>

            <div className="relative">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-6 block" style={{ color: pc }}>
                {tMeta.label}
              </span>
              <p className="text-2xl lg:text-4xl font-bold text-gray-900 leading-[1.3] tracking-tight max-w-3xl mx-auto mb-10">
                "{featuredTestimonial.quote}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: pc }}
                >
                  {featuredTestimonial.initials}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">{featuredTestimonial.name}</div>
                  <div className="text-sm text-gray-400">{featuredTestimonial.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary testimonials */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 border-t border-gray-200">
            {testimonials.slice(0, 3).map((t: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>
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

      {/* ═══════ CTA — 50/50 SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[40vh]">
        {/* Left: white */}
        <div className="w-full lg:w-1/2 flex items-center py-24 px-8 sm:px-12 lg:px-20 bg-white border-t border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-5 block text-gray-400">
              {cta.badge}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter leading-[1.0] mb-6 whitespace-pre-line">
              {cta.headline}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
              {cta.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {cta.buttons[0] && (
                <a
                  href={cta.buttons[0].link}
                  className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                  style={{ backgroundColor: pc }}
                >
                  {cta.buttons[0].text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: primary color */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-24 px-8 sm:px-12 lg:px-20 relative overflow-hidden" style={{ backgroundColor: pc }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-[0.06]" />
          <div className="relative text-center">
            <p className="text-white/60 text-sm uppercase tracking-widest font-medium mb-6">Ready to connect?</p>
            {cta.buttons[1] && (
              <a
                href={cta.buttons[1].link}
                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/15 transition-all duration-300 text-lg"
              >
                {cta.buttons[1].text}
              </a>
            )}
            <p className="text-white/40 text-xs mt-6 font-medium">We respond within 24 hours</p>
          </div>
        </div>
      </section>
    </>
  );
}
