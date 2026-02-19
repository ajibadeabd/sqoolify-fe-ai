import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  heroStats as defaultHeroStats, pillars as defaultPillars, heroContent, campusImages, aboutStripStats,
  aboutStripContent, featuredTestimonial as defaultFeaturedTestimonial,
  testimonials as defaultTestimonials, homeCtaContent, images,
} from '../shared/content';

export default function HomePage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero')
  const featuresSec = getSection(sitePage, 'features')
  const gallerySec = getSection(sitePage, 'gallery')
  const textSec = getSection(sitePage, 'text')
  const testimonialsSec = getSection(sitePage, 'testimonials')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = heroContent(name)
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    stats: heroSec?.stats || defaultHeroStats,
    buttons: heroSec?.buttons || [
      { text: 'Apply Now', link: '/admissions', variant: 'primary' },
      { text: 'Our Story', link: '/about', variant: 'secondary' },
    ],
  }

  const features = {
    label: featuresSec?.label || `Why ${name}`,
    title: featuresSec?.title || 'Real-world success starts here',
    items: featuresSec?.features?.map((f: any) => ({
      title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'academic',
    })) || defaultPillars,
  }

  const gallery = {
    label: gallerySec?.label || 'Campus Life',
    title: gallerySec?.title || 'A second home',
    images: gallerySec?.images || {
      main: campusImages.main,
      items: [campusImages.library, campusImages.computerLab, campusImages.sports],
    },
    statCard: gallerySec?.statCard || { val: '15+', label: 'Clubs' },
  }

  const about = {
    label: textSec?.label || 'Our Story',
    title: textSec?.title || 'Excellence since day one',
    para1: textSec?.para1 || textSec?.content || aboutStripContent(name).para1,
    para2: textSec?.para2 || aboutStripContent(name).para2,
    stats: textSec?.stats || aboutStripStats,
    link: textSec?.link || { text: 'Read More', href: '/about' },
  }

  const _ft = testimonialsSec?.testimonials?.[0]
  const featuredTestimonial = _ft
    ? { name: _ft.name, role: _ft.role || '', initials: _ft.initials || _ft.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: _ft.quote || _ft.content || '' }
    : defaultFeaturedTestimonial
  const tMeta = {
    label: testimonialsSec?.label || 'Testimonials',
    title: testimonialsSec?.title || 'What they say',
  }
  const testimonials = testimonialsSec?.testimonials?.slice(1).map((t: any) => ({
    name: t.name, role: t.role || '', initials: t.initials || t.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: t.quote || t.content || '',
  })) || defaultTestimonials

  const _dc = homeCtaContent(name)
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || ctaSec?.title || _dc.headline,
    description: ctaSec?.description || _dc.description,
    buttons: ctaSec?.buttons || [
      { text: 'Begin Application', link: '/admissions', variant: 'primary' },
      { text: 'Talk to Us', link: '/contact', variant: 'secondary' },
    ],
  };

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED IMAGE ═══════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <img src={images.homeHeroGrid[0].src} alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48 lg:pb-28">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/90 text-sm font-medium uppercase tracking-wider">{hero.badge}</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem] font-black text-white leading-[0.95] tracking-tighter mb-8 max-w-5xl uppercase">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>

          <p className="text-lg lg:text-xl text-white/50 max-w-xl leading-relaxed mb-10">
            {hero.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            {hero.buttons[0] && (
              <a
                href={hero.buttons[0].link}
                className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all duration-300"
                style={{ backgroundColor: pc, color: '#fff' }}
              >
                {hero.buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {hero.buttons[1] && (
              <a
                href={hero.buttons[1].link}
                className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                {hero.buttons[1].text}
              </a>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            {hero.stats.map((s: any) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PILLARS — EDGE-TO-EDGE DARK/LIGHT ALTERNATING ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{features.label}</p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase max-w-3xl">
              {features.title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {features.items.map((p: any) => (
              <div key={p.title} className="bg-gray-950 p-10 hover:bg-gray-900 transition-colors duration-300 group">
                <div className="w-14 h-14 flex items-center justify-center mb-6 border-2 group-hover:border-transparent group-hover:bg-white/10 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                  <Icon name={p.iconName} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAMPUS LIFE — FULL-WIDTH BENTO ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{gallery.label}</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              {gallery.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-2 h-[500px] lg:h-[600px]">
            <div className="col-span-2 row-span-2 overflow-hidden relative group">
              <img src={gallery.images.main.src} alt={gallery.images.main.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="inline-block px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-2" style={{ backgroundColor: pc }}>{gallery.images.main.tag}</span>
                <h3 className="text-2xl font-black text-white uppercase">{gallery.images.main.label}</h3>
              </div>
            </div>
            {gallery.images.items.map((img: any) => (
              <div key={img.alt} className="overflow-hidden relative group">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4"><h4 className="text-sm font-black text-white uppercase tracking-wide">{img.label}</h4></div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center" style={{ backgroundColor: pc }}>
              <div className="text-4xl font-black text-white">{gallery.statCard.val}</div>
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">{gallery.statCard.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT STRIP — ASYMMETRIC ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 relative">
              <div className="overflow-hidden">
                <img src={images.aboutStrip} alt="Students" className="w-full h-[500px] object-cover" />
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>{about.label}</p>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-8">
                {about.title}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-5">{about.para1}</p>
              <p className="text-gray-500 leading-relaxed mb-10">{about.para2}</p>

              <div className="flex gap-10 mb-10 pt-8 border-t border-white/10">
                {about.stats.map((s: any) => (
                  <div key={s.label}>
                    <div className="text-3xl font-black text-white">{s.val}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a href={about.link.href} className="group inline-flex items-center gap-3 font-bold text-lg uppercase tracking-wider" style={{ color: pc }}>
                {about.link.text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{tMeta.label}</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              {tMeta.title}
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured */}
            <div className="lg:row-span-2 p-10 lg:p-12 text-white relative overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="text-[120px] font-serif leading-none opacity-10 -mb-16">"</div>
              <p className="text-xl lg:text-2xl font-bold leading-relaxed mb-10">{featuredTestimonial.quote}</p>
              <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                <div className="w-14 h-14 bg-white/20 flex items-center justify-center font-black text-lg backdrop-blur-sm">{featuredTestimonial.initials}</div>
                <div>
                  <div className="font-black uppercase tracking-wide">{featuredTestimonial.name}</div>
                  <div className="text-white/60 text-sm">{featuredTestimonial.role}</div>
                </div>
              </div>
            </div>

            {testimonials.map((t: any, i: number) => (
              <div key={i} className="border-2 border-gray-100 p-8 hover:border-gray-200 transition-colors">
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>{t.initials}</div>
                  <div>
                    <div className="font-black text-gray-900 text-sm uppercase tracking-wide">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA — FULL-BLEED ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={images.aboutHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/80 text-sm font-bold uppercase tracking-wider">{cta.badge}</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {cta.buttons[0] && (
              <a
                href={cta.buttons[0].link}
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
                style={{ backgroundColor: pc, color: '#fff' }}
              >
                {cta.buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {cta.buttons[1] && (
              <a
                href={cta.buttons[1].link}
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all"
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
