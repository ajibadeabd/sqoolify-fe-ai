import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  admissionsHeroContent, admissionSteps as defaultAdmissionSteps,
  includedItems as defaultIncludedItems, requiredDocs as defaultRequiredDocs,
  ageRequirements as defaultAgeRequirements, admissionsCtaContent, images,
} from '../shared/content';

export default function AdmissionsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero')
  const textSec = getSection(sitePage, 'text')
  const featuresSec = getSection(sitePage, 'features')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = admissionsHeroContent(name)
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || images.admissionsHero,
  }
  const heroButtonText = heroSec?.heroButtonText || 'Talk to Admissions'

  const stepsBadge = textSec?.stepsBadge || 'How To Apply'
  const stepsHeading = textSec?.stepsHeading || 'Five simple steps to'
  const stepsHeadingSub = textSec?.stepsHeadingSub || 'join our family'
  const admissionSteps: { step: string; title: string; desc: string; iconName: string }[] = textSec?.admissionSteps || defaultAdmissionSteps

  const includedBadge = featuresSec?.includedBadge || "What's Included"
  const includedHeading = featuresSec?.includedHeading || 'Everything your child needs'
  const includedHeadingSub = featuresSec?.includedHeadingSub || 'to thrive'
  const includedDescription = featuresSec?.includedDescription || 'Every enrolled student benefits from a comprehensive package designed for academic and personal growth.'
  const includedItems = featuresSec?.features?.map((f: any) => ({
    title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'curriculum',
  })) || defaultIncludedItems

  const docsBadge = textSec?.docsBadge || 'Required Documents'
  const requiredDocs: string[] = textSec?.requiredDocs || defaultRequiredDocs

  const ageBadge = textSec?.ageBadge || 'Age Requirements'
  const ageRequirements: { level: string; age: string }[] = textSec?.ageRequirements || defaultAgeRequirements

  const _dc = admissionsCtaContent(name)
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  }
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Contact Admissions', link: '/contact', variant: 'primary' },
    { text: 'View FAQ', link: '/faq', variant: 'secondary' },
  ]

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0">
          <img
            src={hero.heroImage}
            alt="Students"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05] bg-white" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">{hero.badge}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {hero.headline}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">{hero.headlineSub}</span>
            </h1>
            <p className="text-xl text-white/50 max-w-lg leading-relaxed mb-10">
              {hero.description}
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
              style={{ color: pc }}
            >
              {heroButtonText}
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ ADMISSION STEPS — NUMBERED CARDS ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {stepsBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1]">
              {stepsHeading}<br />
              <span style={{ color: pc }}>{stepsHeadingSub}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {admissionSteps.map((s) => (
              <div key={s.step} className="group relative bg-gray-50/80 rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                    <Icon name={s.iconName} className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black text-gray-300 tracking-wider">{s.step}</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}20` }}>
              {includedBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.1] mb-5">
              {includedHeading}<br />{includedHeadingSub}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {includedDescription}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {includedItems.map((f) => (
              <div key={f.title} className="group bg-white/5 rounded-3xl p-8 lg:p-10 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                  <Icon name={f.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS — SPLIT LAYOUT ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Documents */}
            <div className="bg-gray-50/80 rounded-3xl p-10 lg:p-12 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6" style={{ backgroundColor: pc }}>
                <Icon name="documents" className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">{docsBadge}</h3>
              <div className="space-y-4">
                {requiredDocs.map((doc: string) => (
                  <div key={doc} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: pc }}>
                      <Icon name="check" className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-gray-600 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Requirements */}
            <div className="bg-gray-50/80 rounded-3xl p-10 lg:p-12 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6" style={{ backgroundColor: pc }}>
                <Icon name="community" className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">{ageBadge}</h3>
              <div className="space-y-3">
                {ageRequirements.map((r) => (
                  <div key={r.level} className="flex items-center justify-between py-3.5 border-b border-gray-200/60 last:border-0">
                    <span className="font-bold text-gray-900">{r.level}</span>
                    <span className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ color: pc, backgroundColor: `${pc}10` }}>{r.age}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] bg-white" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05] bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">{cta.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
            {cta.headline}
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            {cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((btn, i) => (
              btn.variant === 'primary' ? (
                <a key={i} href={btn.link} className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300" style={{ color: pc }}>
                  {btn.text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a key={i} href={btn.link} className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                  {btn.text}
                </a>
              )
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
