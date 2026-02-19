import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  admissionsHeroContent, admissionSteps as defaultAdmissionSteps,
  includedItems as defaultIncludedItems, requiredDocs as defaultRequiredDocs,
  ageRequirements as defaultAgeRequirements, admissionsCtaContent, images,
} from '../shared/content';

export default function AdmissionsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero')
  const featuresSec = getSection(sitePage, 'features')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = admissionsHeroContent(name)
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
  }

  const admissionSteps = defaultAdmissionSteps
  const includedItems = featuresSec?.features?.map((f: any) => ({
    title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'curriculum',
  })) || defaultIncludedItems
  const requiredDocs = defaultRequiredDocs
  const ageRequirements = defaultAgeRequirements

  const _dc = admissionsCtaContent(name)
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || ctaSec?.title || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED ═══════ */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <img src={images.admissionsHero} alt="Admissions" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">{hero.badge}</span>
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-6 max-w-4xl">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed">{hero.description}</p>
        </div>
      </section>

      {/* ═══════ ADMISSION STEPS ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>How To Apply</p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase">
              Five steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10">
            {admissionSteps.map((s, i) => (
              <div key={i} className="bg-gray-950 p-8 hover:bg-gray-900 transition-colors group">
                <div className="text-4xl font-black mb-4" style={{ color: pc }}>{s.step}</div>
                <div className="w-12 h-12 flex items-center justify-center mb-4 border-2 group-hover:border-transparent group-hover:bg-white/10 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                  <Icon name={s.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>What You Get</p>
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">
              Everything included
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
            {includedItems.map((item) => (
              <div key={item.title} className="bg-white p-10 hover:bg-gray-50 transition-colors group">
                <div className="w-14 h-14 flex items-center justify-center mb-6 border-2 group-hover:border-transparent group-hover:bg-gray-100 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                  <Icon name={item.iconName} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Documents */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Required Documents</p>
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase mb-8">What to prepare</h3>
              <div className="space-y-0">
                {requiredDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 border-b border-white/10 last:border-b-0">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: pc }}>
                      <Icon name="check" className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Requirements */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Age Requirements</p>
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase mb-8">Entry levels</h3>
              <div className="space-y-0">
                {ageRequirements.map((req, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-white/10 last:border-b-0">
                    <span className="font-black text-white uppercase tracking-wide">{req.level}</span>
                    <span className="text-sm font-bold px-4 py-1.5" style={{ color: pc, backgroundColor: `${pc}15` }}>{req.age}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA — FULL-BLEED ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={images.contactHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/80 text-sm font-bold uppercase tracking-wider">{cta.badge}</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
            style={{ backgroundColor: pc, color: '#fff' }}
          >
            Contact Admissions
            <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </>
  );
}
