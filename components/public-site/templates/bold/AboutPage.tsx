import type { PublicSchool } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import {
  aboutHeroStats, aboutHeroContent, timeline, missionText, visionText,
  coreValues, approachItems, aboutCtaContent, images,
} from '../shared/content';

export default function AboutPage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';
  const hero = aboutHeroContent(name);
  const cta = aboutCtaContent(name);

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED IMAGE ═══════ */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <img src={images.aboutHero} alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">{hero.badge}</span>
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-6 max-w-4xl">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed mb-12">{hero.description}</p>

          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            {aboutHeroStats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR STORY — TIMELINE ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>Our Journey</p>
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase mb-12">
                How we got here
              </h2>

              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={i} className="relative pl-10 pb-12 last:pb-0">
                    <div className="absolute left-0 top-2 w-4 h-4" style={{ backgroundColor: pc }} />
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-gray-100" />
                    )}
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.getDesc(name)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <img src={images.aboutStory} alt="Our story" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>What Drives Us</p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase">
              Mission & Vision
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-white/10">
            <div className="bg-gray-950 p-10 lg:p-14">
              <div className="w-14 h-14 flex items-center justify-center mb-6 border-2" style={{ borderColor: `${pc}40`, color: pc }}>
                <Icon name="mission" className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed text-lg">{missionText}</p>
            </div>
            <div className="bg-gray-950 p-10 lg:p-14">
              <div className="w-14 h-14 flex items-center justify-center mb-6 border-2" style={{ borderColor: `${pc}40`, color: pc }}>
                <Icon name="vision" className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed text-lg">{visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CORE VALUES ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Our Values</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              What we stand for
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
            {coreValues.map((v) => (
              <div key={v.title} className="bg-white p-10 hover:bg-gray-50 transition-colors group">
                <div className="w-14 h-14 flex items-center justify-center mb-6 border-2 group-hover:border-transparent transition-all" style={{ borderColor: `${pc}40`, color: pc, backgroundColor: 'transparent' }}>
                  <Icon name={v.iconName} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR APPROACH ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>Our Approach</p>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-10">
                How we teach
              </h2>
              <div className="space-y-6">
                {approachItems.map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ backgroundColor: pc }}>
                      <Icon name="check" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-wide mb-1">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <img src={images.aboutApproach} alt="Our approach" className="w-full h-[600px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA — FULL-BLEED ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={images.admissionsHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all" style={{ backgroundColor: pc, color: '#fff' }}>
              Schedule a Visit
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/admissions" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 transition-all">
              Apply Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
