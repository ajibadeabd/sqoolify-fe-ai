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
  const pc = school.siteConfig?.primaryColor || '#23b864';
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
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
  };
  const heroStats = heroSec?.stats || defaultAboutHeroStats;

  const storyBadge = textSec?.storyBadge || 'Our Story';
  const storyHeading = textSec?.storyHeading || 'From a single classroom to a centre of excellence';
  const storyImage = textSec?.storyImage || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80';
  const timeline: { title: string; desc: string }[] = textSec?.timeline || defaultTimeline.map((t: any) => ({ title: t.title, desc: t.getDesc(name) }));
  const accreditationTitle = textSec?.accreditationTitle || 'Accredited Institution';
  const accreditationDesc = textSec?.accreditationDesc || 'Approved by the Federal Ministry of Education';

  const missionLabel = textSec?.missionLabel || 'Our Mission';
  const missionText = textSec?.missionText || defaultMissionText;
  const visionLabel = textSec?.visionLabel || 'Our Vision';
  const visionText = textSec?.visionText || defaultVisionText;

  const valuesBadge = featuresSec?.valuesBadge || 'Core Values';
  const valuesHeading = featuresSec?.valuesHeading || 'Six values that shape everything we do';
  const coreValues = featuresSec?.features?.map((f: any) => ({
    title: f.title, desc: f.description || f.desc || '', iconName: f.iconName || 'excellence',
  })) || defaultCoreValues;

  const approachBadge = textSec?.approachBadge || 'How We Teach';
  const approachHeading = textSec?.approachHeading || "An approach built around your child's success";
  const approachImage = textSec?.approachImage || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80';
  const approachItems: { title: string; desc: string }[] = textSec?.approachItems || defaultApproachItems;

  const _dc = aboutCtaContent(name);
  const cta = { headline: ctaSec?.headline || ctaSec?.title || _dc.headline, description: ctaSec?.description || _dc.description };
  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'Schedule a Visit', link: '/contact', variant: 'primary' },
    { text: 'View Admissions', link: '/admissions', variant: 'secondary' },
  ];

  return (
    <>
      {/* ═══════ HERO — SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] overflow-hidden">
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-16 lg:py-0">
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />
          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>02 / About Us</span>
            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed">{hero.description}</p>
          </div>
          {/* Stats strip */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 grid grid-cols-4 hidden lg:grid">
            {heroStats.map((s: any, i: number) => (
              <div key={s.label} className={`py-5 px-6 ${i < heroStats.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <div className="text-2xl font-black text-gray-950 tracking-tight">{s.val}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img src={hero.heroImage} alt="School campus" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
        </div>
      </section>

      {/* ═══════ ORIGIN STORY ═══════ */}
      <section className="bg-white py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
                  <img src={storyImage} alt="Students" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 pointer-events-none" style={{ borderColor: `${pc}40` }} />
              </div>
              <div className="mt-8 p-5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: pc }}>
                  <Icon name="academic" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{accreditationTitle}</div>
                  <div className="text-xs text-gray-400">{accreditationDesc}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-6 block" style={{ color: pc }}>{storyBadge}</span>
              <h2 className="text-3xl lg:text-[2.8rem] font-black text-gray-950 tracking-tighter leading-[1.05] mb-12">{storyHeading}</h2>
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={i} className="relative pl-8 border-l-2" style={{ borderColor: `${pc}30` }}>
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pc }} />
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION ═══════ */}
      <section className="bg-gray-50 py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-10 mb-16">
            <span className="text-[8rem] font-black leading-none select-none hidden lg:block" style={{ WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}>MV</span>
            <div className="pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>What Drives Us</span>
              <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-950 tracking-tighter leading-[1.05]">Mission &amp; Vision</h2>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="relative rounded-2xl p-10 lg:p-14 text-white overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-8">
                  <Icon name="mission" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{missionLabel}</h3>
                <p className="text-white/70 text-lg leading-relaxed">{missionText}</p>
              </div>
            </div>
            <div className="rounded-2xl p-10 lg:p-14 bg-white border border-gray-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-8" style={{ backgroundColor: `${pc}10`, color: pc }}>
                <Icon name="vision" className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{visionLabel}</h3>
              <p className="text-gray-500 text-lg leading-relaxed">{visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CORE VALUES — NUMBERED GRID ═══════ */}
      <section className="bg-white py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-12 mb-16">
            <span className="text-[8rem] font-black leading-none select-none hidden lg:block" style={{ WebkitTextStroke: `2px ${pc}`, color: 'transparent' } as any}>03</span>
            <div className="pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{valuesBadge}</span>
              <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-950 tracking-tighter leading-[1.05]">{valuesHeading}</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gray-100">
            {coreValues.map((v: any, i: number) => (
              <div key={v.title} className="group p-10 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50 transition-colors duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-5 text-[5rem] font-black leading-none select-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity" style={{ color: pc }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: pc }}>
                  <Icon name={v.iconName} className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ APPROACH ═══════ */}
      <section className="bg-gray-50 py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-6 block" style={{ color: pc }}>{approachBadge}</span>
            <h2 className="text-3xl lg:text-[2.8rem] font-black text-gray-950 tracking-tighter leading-[1.05] mb-10">{approachHeading}</h2>
            <div className="space-y-5">
              {approachItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: pc }}>
                    <Icon name="check" className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img src={approachImage} alt="Teaching" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-full h-full rounded-2xl border-2 pointer-events-none" style={{ borderColor: `${pc}40` }} />
          </div>
        </div>
      </section>

      {/* ═══════ CTA — 50/50 ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[35vh]">
        <div className="w-full lg:w-1/2 flex items-center py-24 px-8 sm:px-12 lg:px-20 bg-white border-t border-gray-100">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter leading-[1.0] mb-6 whitespace-pre-line">{cta.headline}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">{cta.description}</p>
            <div className="flex flex-wrap gap-4">
              {ctaButtons.map((btn, i) =>
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
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white opacity-[0.06]" />
          <div className="relative text-center">
            <p className="text-6xl font-black text-white/10 mb-4 select-none tracking-tighter">Since Day One</p>
            <p className="text-white/60 text-sm uppercase tracking-widest">Excellence at every step</p>
          </div>
        </div>
      </section>
    </>
  );
}
