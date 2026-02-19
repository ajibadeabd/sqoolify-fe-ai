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
      { text: 'Start Application', link: '/admissions', variant: 'primary' },
      { text: 'Our Story', link: '/about', variant: 'secondary' },
    ],
  }

  const features = {
    label: featuresSec?.label || `Why ${name}`,
    title: featuresSec?.title || 'An education designed for excellence',
    subtitle: featuresSec?.subtitle || 'We go beyond textbooks. Every programme develops critical thinkers, confident communicators, and compassionate leaders.',
    items: featuresSec?.features?.map((f: any) => ({
      title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'academic',
    })) || defaultPillars,
  }

  const gallery = {
    label: gallerySec?.label || 'Campus Life',
    title: gallerySec?.title || 'More than a school',
    images: gallerySec?.images || {
      main: campusImages.main,
      items: [campusImages.library, campusImages.computerLab, campusImages.sports],
    },
    statCard: gallerySec?.statCard || { val: '15+', label: 'Clubs & Activities' },
  }

  const about = {
    label: textSec?.label || 'Our Story',
    title: textSec?.title || 'Building a legacy of excellence',
    para1: textSec?.para1 || textSec?.content || aboutStripContent(name).para1,
    para2: textSec?.para2 || aboutStripContent(name).para2,
    stats: textSec?.stats || aboutStripStats,
    link: textSec?.link || { text: 'Read our full story', href: '/about' },
    floatingCard: textSec?.floatingCard || { val: 'A+', label: 'Average Grade' },
  }

  const _ft = testimonialsSec?.testimonials?.[0]
  const featuredTestimonial = _ft
    ? { name: _ft.name, role: _ft.role || '', initials: _ft.initials || _ft.name?.split(' ').map((w: string) => w[0]).join('') || '', quote: _ft.quote || _ft.content || '' }
    : defaultFeaturedTestimonial
  const tMeta = {
    label: testimonialsSec?.label || 'Testimonials',
    title: testimonialsSec?.title || 'Trusted by families',
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
      { text: 'Talk to Admissions', link: '/contact', variant: 'secondary' },
    ],
  };

  return (
    <>
      {/* ═══════ HERO — CENTERED MINIMAL ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${pc}, transparent 70%)` }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-10">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-gray-600 text-sm font-medium">{hero.badge}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            {hero.headline}{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${pc}, ${pc}99)` }}>
              {hero.headlineSub}
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            {hero.description}
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20">
            {hero.buttons[0] && (
              <a
                href={hero.buttons[0].link}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ backgroundColor: pc }}
              >
                {hero.buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
            {hero.buttons[1] && (
              <a
                href={hero.buttons[1].link}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                {hero.buttons[1].text}
              </a>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
            {hero.stats.map((s: any) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold" style={{ color: pc }}>{s.val}</div>
                <div className="text-sm text-gray-400 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PILLARS — CLEAN CARD GRID ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{features.label}</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-5">
              {features.title}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {features.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.items.map((p: any) => (
              <div key={p.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name={p.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAMPUS LIFE — MINIMAL GRID ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{gallery.label}</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">{gallery.title}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[400px] lg:h-[480px]">
            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
              <img src={gallery.images.main.src} alt={gallery.images.main.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2" style={{ backgroundColor: pc }}>{gallery.images.main.tag}</span>
                <h3 className="text-lg font-bold text-white">{gallery.images.main.label}</h3>
              </div>
            </div>
            {gallery.images.items.map((img: any) => (
              <div key={img.alt} className="rounded-2xl overflow-hidden relative group">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3"><h4 className="text-sm font-semibold text-white">{img.label}</h4></div>
              </div>
            ))}
            <div className="rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: `${pc}08`, border: `1px solid ${pc}20` }}>
              <div className="text-3xl font-bold" style={{ color: pc }}>{gallery.statCard.val}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{gallery.statCard.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT STRIP ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <img src={images.aboutStrip} alt="Students" className="w-full h-[420px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg border border-gray-100 p-5 hidden sm:block">
                <div className="text-2xl font-bold" style={{ color: pc }}>{about.floatingCard.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{about.floatingCard.label}</div>
                <div className="flex gap-0.5 mt-2">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{about.label}</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-6">{about.title}</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">{about.para1}</p>
              <p className="text-gray-400 leading-relaxed mb-8">{about.para2}</p>

              <div className="flex gap-8">
                {about.stats.map((s: any) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold" style={{ color: pc }}>{s.val}</div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <a href={about.link.href} className="group inline-flex items-center gap-2 mt-8 font-semibold" style={{ color: pc }}>
                {about.link.text}
                <Icon name="arrowRight" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>{tMeta.label}</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">{tMeta.title}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-10 text-white relative overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="text-7xl font-serif leading-none opacity-15 mb-2">"</div>
              <p className="text-xl font-medium leading-relaxed mb-8 -mt-6">{featuredTestimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold backdrop-blur-sm">{featuredTestimonial.initials}</div>
                <div>
                  <div className="font-bold">{featuredTestimonial.name}</div>
                  <div className="text-white/60 text-sm">{featuredTestimonial.role}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {testimonials.slice(0, 2).map((t: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">{t.quote}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>{t.initials}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl px-8 py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: pc }}>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-sm">{cta.badge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-5 whitespace-pre-line">{cta.headline}</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-10">{cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {cta.buttons[0] && (
                  <a href={cta.buttons[0].link} className="group inline-flex items-center justify-center gap-2.5 bg-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all" style={{ color: pc }}>
                    {cta.buttons[0].text}
                    <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
                {cta.buttons[1] && (
                  <a href={cta.buttons[1].link} className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg text-white border border-white/20 hover:bg-white/10 transition-all">
                    {cta.buttons[1].text}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
