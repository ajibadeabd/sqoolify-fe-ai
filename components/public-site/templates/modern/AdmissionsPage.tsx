import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  admissionsHeroContent, admissionSteps as defaultAdmissionSteps,
  includedItems as defaultIncludedItems, requiredDocs as defaultRequiredDocs,
  ageRequirements as defaultAgeRequirements, admissionsCtaContent,
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
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.05]" style={{ background: `radial-gradient(circle, ${pc}, transparent 70%)` }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-gray-600 text-sm font-medium">{hero.badge}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
            {hero.headline}{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${pc}, ${pc}99)` }}>
              {hero.headlineSub}
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">{hero.description}</p>
        </div>
      </section>

      {/* ═══════ ADMISSION STEPS ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>How To Apply</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">Five simple steps</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {admissionSteps.map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name={s.iconName} className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: pc }}>Step {s.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>What You Get</p>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">Everything included</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedItems.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name={item.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Documents */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Required Documents</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What to prepare</h3>
              <div className="space-y-3">
                {requiredDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${pc}15`, color: pc }}>
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Requirements */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Age Requirements</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Entry levels</h3>
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {ageRequirements.map((req, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < ageRequirements.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="font-semibold text-gray-900">{req.level}</span>
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ color: pc, backgroundColor: `${pc}10` }}>{req.age}</span>
                  </div>
                ))}
              </div>
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
                <a href="/contact" className="group inline-flex items-center justify-center gap-2.5 bg-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all" style={{ color: pc }}>
                  Contact Admissions
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
