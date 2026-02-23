import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  aboutHeroStats as defaultAboutHeroStats, aboutHeroContent,
  missionText as defaultMissionText, visionText as defaultVisionText,
  coreValues as defaultCoreValues, approachItems as defaultApproachItems,
  aboutCtaContent, timeline as defaultTimeline,
} from '../shared/content';

export default function AboutPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1a5634';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero');
  const textSec = getSection(sitePage, 'text');
  const featuresSec = getSection(sitePage, 'features');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = aboutHeroContent(name);
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80',
  };
  const heroStats = heroSec?.stats || defaultAboutHeroStats;

  const storyBadge = textSec?.storyBadge || 'Our Story';
  const storyHeading = textSec?.storyHeading || 'From a single classroom to a centre of excellence';
  const storyImage = textSec?.storyImage || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80';
  const timeline: { title: string; desc: string }[] = textSec?.timeline || defaultTimeline.map((t: any) => ({ title: t.title, desc: t.getDesc(name) }));
  const accreditationTitle = textSec?.accreditationTitle || 'Accredited Institution';
  const accreditationDesc = textSec?.accreditationDesc || 'Approved by the Federal Ministry of Education';

  const missionVisionBadge = textSec?.missionVisionBadge || 'What Drives Us';
  const missionVisionHeading = textSec?.missionVisionHeading || 'Mission & Vision';
  const missionLabel = textSec?.missionLabel || 'Our Mission';
  const missionText = textSec?.missionText || defaultMissionText;
  const visionLabel = textSec?.visionLabel || 'Our Vision';
  const visionText = textSec?.visionText || defaultVisionText;

  const valuesBadge = featuresSec?.valuesBadge || 'What We Stand For';
  const valuesHeading = featuresSec?.valuesHeading || 'Six values that shape everything we do';
  const coreValues = featuresSec?.features?.map((f: any) => ({
    title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'excellence',
  })) || defaultCoreValues;

  const approachBadge = textSec?.approachBadge || 'How We Teach';
  const approachHeading = textSec?.approachHeading || "An approach built around your child's success";
  const approachImage = textSec?.approachImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80';
  const approachItems: { title: string; desc: string }[] = textSec?.approachItems || defaultApproachItems;
  const approachTestimonial = textSec?.approachTestimonial || {
    quote: "The teachers here don't just teach — they inspire. My daughter looks forward to school every single morning.",
    initials: 'AO',
    label: 'Parent Testimonial',
  };

  const _dc = aboutCtaContent(name);
  const cta = {
    headline: ctaSec?.headline || ctaSec?.title || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Schedule a Visit', link: '/contact', variant: 'primary' },
    { text: 'View Admissions', link: '/admissions', variant: 'secondary' },
  ];

  return (
    <>
      {/* ═══════ HERO — EDITORIAL COVER ═══════ */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-black">
        <img
          src={hero.heroImage}
          alt="School campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-24 pt-40">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <span
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 mb-8"
                style={{ backgroundColor: `${pc}20`, color: 'white' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold tracking-wide">{hero.badge}</span>
              </span>

              <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black tracking-tight leading-[1.05] text-white mb-6">
                {hero.headline}
                <span className="block text-white/60">{hero.headlineSub}</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg leading-relaxed">{hero.description}</p>
            </div>

            {/* Stats card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-[2.5rem] p-8 lg:p-10">
              <div className="grid grid-cols-2 gap-6">
                {heroStats.map((s: any) => (
                  <div key={s.label}>
                    <div className="text-3xl lg:text-4xl font-black text-white">{s.val}</div>
                    <div className="text-sm text-white/40 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ORIGIN STORY — TIMELINE ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img src={storyImage} alt="Students in classroom" className="w-full h-[500px] object-cover" />
              </div>
              <div className="mt-6 p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-white font-bold" style={{ backgroundColor: pc }}>
                    <Icon name="academic" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{accreditationTitle}</div>
                    <div className="text-sm text-gray-400">{accreditationDesc}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}10` }}>
                {storyBadge}
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-gray-900 tracking-tight leading-[1.15] mb-10 whitespace-pre-line">
                {storyHeading}
              </h2>

              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-gray-100">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pc }} />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION ═══════ */}
      <section className="px-6 py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {missionVisionBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1]">
              {missionVisionHeading}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="relative rounded-[2.5rem] p-10 lg:p-14 text-white overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.06] bg-white" />
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/15 flex items-center justify-center mb-8">
                  <Icon name="mission" className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">{missionLabel}</h3>
                <p className="text-white/70 text-lg leading-relaxed">{missionText}</p>
              </div>
            </div>

            <div className="relative rounded-[2.5rem] p-10 lg:p-14 bg-white border border-gray-200 overflow-hidden">
              <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-8" style={{ backgroundColor: `${pc}10`, color: pc }}>
                <Icon name="vision" className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{visionLabel}</h3>
              <p className="text-gray-500 text-lg leading-relaxed">{visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CORE VALUES ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {valuesBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1] whitespace-pre-line">
              {valuesHeading}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValues.map((v: any) => (
              <div
                key={v.title}
                className="group bg-gray-50 rounded-[2.5rem] p-8 lg:p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ backgroundColor: pc }}
                >
                  <Icon name={v.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR APPROACH ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}20` }}>
                {approachBadge}
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-white tracking-tight leading-[1.15] mb-10 whitespace-pre-line">
                {approachHeading}
              </h2>

              <div className="space-y-5">
                {approachItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ backgroundColor: pc }}>
                      <Icon name="check" className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">{item.title}</div>
                      <div className="text-gray-400 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
                <img src={approachImage} alt="Teaching approach" className="w-full h-[550px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-white rounded-[1.5rem] shadow-xl p-6 max-w-[280px] hidden sm:block">
                <p className="text-gray-600 text-sm leading-relaxed italic mb-3">
                  "{approachTestimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: pc }}>{approachTestimonial.initials}</div>
                  <div className="text-xs text-gray-400 font-medium">{approachTestimonial.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative px-6 py-36 overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:32px_32px]" />
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] bg-white" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05] bg-white" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
            {cta.headline}
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            {cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaButtons.map((btn, i) =>
              btn.variant === 'primary' ? (
                <a
                  key={i}
                  href={btn.link}
                  className="group inline-flex items-center justify-center gap-3 bg-white px-12 py-5 rounded-2xl text-lg font-black hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all"
                  style={{ color: pc }}
                >
                  {btn.text}
                  <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a key={i} href={btn.link} className="inline-flex items-center justify-center px-12 py-5 rounded-2xl text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                  {btn.text}
                </a>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
