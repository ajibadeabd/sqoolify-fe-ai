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
      {/* ═══════ HERO — SOFT GRADIENT ═══════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
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

          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">{hero.description}</p>

          <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
            {aboutHeroStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold" style={{ color: pc }}>{s.val}</div>
                <div className="text-sm text-gray-400 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR STORY — TIMELINE ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Our Journey</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">How we got here</h2>
          </div>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-10 pb-12 last:pb-0">
                <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-md" style={{ backgroundColor: pc }} />
                {i < timeline.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-gray-100" />
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.getDesc(name)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>What Drives Us</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">Mission & Vision</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                <Icon name="mission" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-500 leading-relaxed">{missionText}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                <Icon name="vision" className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-500 leading-relaxed">{visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CORE VALUES ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Our Values</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">What we stand for</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name={v.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR APPROACH ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Our Approach</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-8">How we teach differently</h2>
              <div className="space-y-5">
                {approachItems.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                      <Icon name="check" className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src={images.aboutApproach} alt="Our approach" className="w-full h-[500px] object-cover" />
            </div>
          </div>
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
                <a href="/contact" className="group inline-flex items-center justify-center gap-2.5 bg-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all" style={{ color: pc }}>
                  Schedule a Visit
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="/admissions" className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg text-white border border-white/20 hover:bg-white/10 transition-all">
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
