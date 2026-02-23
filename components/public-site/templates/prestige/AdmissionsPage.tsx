import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  admissionsHeroContent, admissionSteps as defaultAdmissionSteps,
  includedItems as defaultIncludedItems, requiredDocs as defaultRequiredDocs,
  ageRequirements as defaultAgeRequirements, admissionsCtaContent, images,
} from '../shared/content';

export default function AdmissionsPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#23b864';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero');
  const textSec = getSection(sitePage, 'text');
  const featuresSec = getSection(sitePage, 'features');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = admissionsHeroContent(name);
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || images.admissionsHero,
  };
  const heroButtonText = heroSec?.heroButtonText || 'Talk to Admissions';

  const stepsBadge = textSec?.stepsBadge || 'How To Apply';
  const stepsHeading = textSec?.stepsHeading || 'Five simple steps to';
  const stepsHeadingSub = textSec?.stepsHeadingSub || 'join our family';
  const admissionSteps: { step: string; title: string; desc: string; iconName: string }[] = textSec?.admissionSteps || defaultAdmissionSteps;

  const includedBadge = featuresSec?.includedBadge || "What's Included";
  const includedHeading = featuresSec?.includedHeading || 'Everything your child needs';
  const includedHeadingSub = featuresSec?.includedHeadingSub || 'to thrive';
  const includedDescription = featuresSec?.includedDescription || 'Every enrolled student benefits from a comprehensive package designed for academic and personal growth.';
  const includedItems = featuresSec?.features?.map((f: any) => ({
    title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'curriculum',
  })) || defaultIncludedItems;

  const docsBadge = textSec?.docsBadge || 'Required Documents';
  const requiredDocs: string[] = textSec?.requiredDocs || defaultRequiredDocs;

  const ageBadge = textSec?.ageBadge || 'Age Requirements';
  const ageRequirements: { level: string; age: string }[] = textSec?.ageRequirements || defaultAgeRequirements;

  const _dc = admissionsCtaContent(name);
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Contact Admissions', link: '/contact', variant: 'primary' },
    { text: 'View FAQ', link: '/faq', variant: 'secondary' },
  ];

  return (
    <>
      {/* ═══════ HERO — SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] overflow-hidden">
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-16 lg:py-0">
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />
          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>03 / Admissions</span>
            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-10">{hero.description}</p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: pc }}
            >
              {heroButtonText}
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img src={hero.heroImage} alt="Students" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
        </div>
      </section>

      {/* ═══════ ADMISSION STEPS — NUMBERED BORDERED GRID ═══════ */}
      <section className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{stepsBadge}</span>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-950 tracking-tighter">
              {stepsHeading}<br />
              <span style={{ color: pc }}>{stepsHeadingSub}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-5 border border-gray-100">
            {admissionSteps.map((s, i) => (
              <div key={s.step} className={`relative p-8 group hover:bg-gray-50 transition-colors ${i < admissionSteps.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <div
                  className="absolute top-4 right-4 text-[5rem] font-black leading-none select-none pointer-events-none"
                  style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.12 } as any}
                >
                  {s.step}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-6 relative z-10" style={{ backgroundColor: pc }}>
                  <Icon name={s.iconName} className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-2 tracking-tight relative z-10">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S INCLUDED ═══════ */}
      <section className="bg-gray-50 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{includedBadge}</span>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-950 tracking-tighter">
              {includedHeading}<br />
              <span style={{ color: pc }}>{includedHeadingSub}</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mt-4 leading-relaxed">{includedDescription}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border border-gray-200">
            {includedItems.map((f, i) => (
              <div key={f.title} className={`relative p-10 group hover:bg-white transition-all duration-300 ${Math.floor(i / 3) < Math.floor((includedItems.length - 1) / 3) ? 'border-b border-gray-200' : ''} ${i % 3 < 2 ? 'border-r border-gray-200' : ''}`}>
                <div
                  className="absolute bottom-4 right-4 text-[6rem] font-black leading-none select-none pointer-events-none"
                  style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.08 } as any}
                >
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-6" style={{ backgroundColor: pc }}>
                  <Icon name={f.iconName} className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS — SPLIT LAYOUT ═══════ */}
      <section className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Documents */}
          <div className="border border-gray-100 p-10 lg:p-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-6 block" style={{ color: pc }}>{docsBadge}</span>
            <div className="space-y-4">
              {requiredDocs.map((doc: string, i: number) => (
                <div key={doc} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div
                    className="shrink-0 text-2xl font-black w-8 text-right"
                    style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent' } as any}
                  >
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  <span className="text-gray-700 font-medium">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Age Requirements */}
          <div className="border border-gray-100 p-10 lg:p-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-6 block" style={{ color: pc }}>{ageBadge}</span>
            <div className="space-y-0">
              {ageRequirements.map((r) => (
                <div key={r.level} className="flex items-center justify-between py-5 border-b border-gray-100 last:border-0">
                  <span className="font-bold text-gray-900 text-lg">{r.level}</span>
                  <span className="text-sm font-bold px-5 py-2 rounded-lg" style={{ color: pc, backgroundColor: `${pc}10` }}>{r.age}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA — 50/50 ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[35vh]">
        <div className="w-full lg:w-1/2 flex items-center py-24 px-8 sm:px-12 lg:px-20 bg-white border-t border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-5 block" style={{ color: pc }}>{cta.badge}</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter leading-[1.0] mb-6 whitespace-pre-line">{cta.headline}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">{cta.description}</p>
            <div className="flex flex-wrap gap-4">
              {ctaButtons.map((btn: any, i: number) =>
                btn.variant === 'primary' ? (
                  <a key={i} href={btn.link} className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg" style={{ backgroundColor: pc }}>
                    {btn.text}<Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <a key={i} href={btn.link} className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all">
                    {btn.text}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center py-20 px-8 relative overflow-hidden" style={{ backgroundColor: pc }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative text-center">
            <p
              className="font-black leading-none select-none"
              style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', WebkitTextStroke: '2px rgba(255,255,255,0.3)', color: 'transparent' } as any}
            >
              Apply
            </p>
            <p className="text-white/60 text-sm uppercase tracking-widest mt-4">Start your journey today</p>
          </div>
        </div>
      </section>
    </>
  );
}
