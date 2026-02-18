import type { PublicSchool } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import {
  heroStats, pillars, heroContent, campusImages, aboutStripStats,
  aboutStripContent, featuredTestimonial, testimonials, homeCtaContent, images,
} from '../shared/content';

export default function HomePage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';
  const hero = heroContent(name);
  const about = aboutStripContent(name);
  const cta = homeCtaContent(name);

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
            <a
              href="/admissions"
              className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all duration-300"
              style={{ backgroundColor: pc, color: '#fff' }}
            >
              Apply Now
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Our Story
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            {heroStats.map((s) => (
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Why {name}</p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase max-w-3xl">
              Real-world success starts here
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {pillars.map((p) => (
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Campus Life</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              A second home
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-2 h-[500px] lg:h-[600px]">
            <div className="col-span-2 row-span-2 overflow-hidden relative group">
              <img src={campusImages.main.src} alt={campusImages.main.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="inline-block px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-2" style={{ backgroundColor: pc }}>{campusImages.main.tag}</span>
                <h3 className="text-2xl font-black text-white uppercase">{campusImages.main.label}</h3>
              </div>
            </div>
            {[campusImages.library, campusImages.computerLab, campusImages.sports].map((img) => (
              <div key={img.alt} className="overflow-hidden relative group">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4"><h4 className="text-sm font-black text-white uppercase tracking-wide">{img.label}</h4></div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center" style={{ backgroundColor: pc }}>
              <div className="text-4xl font-black text-white">15+</div>
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Clubs</div>
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>Our Story</p>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-8">
                Excellence since day one
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-5">{about.para1}</p>
              <p className="text-gray-500 leading-relaxed mb-10">{about.para2}</p>

              <div className="flex gap-10 mb-10 pt-8 border-t border-white/10">
                {aboutStripStats.map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-black text-white">{s.val}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a href="/about" className="group inline-flex items-center gap-3 font-bold text-lg uppercase tracking-wider" style={{ color: pc }}>
                Read More
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Testimonials</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              What they say
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

            {testimonials.map((t, i) => (
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
            <a
              href="/admissions"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ backgroundColor: pc, color: '#fff' }}
            >
              Begin Application
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
