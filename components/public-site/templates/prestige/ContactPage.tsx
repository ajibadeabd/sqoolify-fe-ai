import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  contactHeroContent, contactCtaContent,
  officeHours as defaultOfficeHours, visitReasons as defaultVisitReasons,
} from '../shared/content';

export default function ContactPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#23b864';
  const name = school.name || 'Our School';
  const hasContact = school.address || school.phone || school.email;

  const heroSec = getSection(sitePage, 'hero');
  const contactSec = getSection(sitePage, 'contact');
  const ctaSec = getSection(sitePage, 'cta');

  const _dh = contactHeroContent();
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
  };

  const _dc = contactCtaContent(name);
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };

  const contactCardsBadge = contactSec?.contactCardsBadge || 'Reach Us';
  const contactCardsHeading = contactSec?.contactCardsHeading || 'Multiple ways to connect';
  const officeHoursBadge = contactSec?.officeHoursBadge || 'Office Hours';
  const officeHoursHeading = contactSec?.officeHoursHeading || 'When you can reach us';
  const officeHoursAfterNote = contactSec?.officeHoursAfterNote || 'For urgent matters outside office hours, please send us an email and we will respond on the next business day.';
  const responseTimeValue = contactSec?.responseTimeValue || '<24h';
  const responseTimeLabel = contactSec?.responseTimeLabel || 'Avg. response time';
  const visitBadge = contactSec?.visitBadge || 'Visit Our Campus';
  const visitHeading = contactSec?.visitHeading || 'Come see what makes us special';
  const visitDescription = contactSec?.visitDescription || 'Schedule a campus visit and experience our learning environment firsthand.';
  const officeHoursImage = contactSec?.officeHoursImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80';
  const heroButtonText = heroSec?.buttonText || contactSec?.heroButtonText || 'Call us now';
  const addressCardTitle = contactSec?.addressCardTitle || 'Visit Our Campus';
  const addressCardAction = contactSec?.addressCardAction || 'Get directions';
  const phoneCardTitle = contactSec?.phoneCardTitle || 'Call Us';
  const phoneCardAction = contactSec?.phoneCardAction || 'Call now';
  const emailCardTitle = contactSec?.emailCardTitle || 'Email Us';
  const emailCardAction = contactSec?.emailCardAction || 'Send email';

  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'View Admissions', link: '/admissions', variant: 'primary' },
    { text: 'Back to Home', link: '/', variant: 'secondary' },
  ];

  const officeHours: { day: string; time: string; note?: string }[] = contactSec?.officeHours || defaultOfficeHours;
  const visitReasons: { title: string; desc: string; iconName: string }[] = contactSec?.visitReasons || defaultVisitReasons;

  return (
    <>
      {/* ═══════ HERO — SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] overflow-hidden">
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-16 lg:py-0">
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />
          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>06 / Contact</span>
            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-10">{hero.description}</p>
            {school.phone && (
              <a
                href={`tel:${school.phone}`}
                className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: pc }}
              >
                {heroButtonText}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img src={hero.heroImage} alt="School campus" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
        </div>
      </section>

      {/* ═══════ CONTACT CARDS ═══════ */}
      {hasContact && (
        <section className="bg-white px-6 py-28">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{contactCardsBadge}</span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter">{contactCardsHeading}</h2>
            </div>

            <div className={`grid gap-0 border border-gray-100 ${[school.address, school.phone, school.email].filter(Boolean).length === 3 ? 'lg:grid-cols-3' : [school.address, school.phone, school.email].filter(Boolean).length === 2 ? 'md:grid-cols-2' : ''}`}>
              {school.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(school.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-10 lg:p-12 hover:bg-gray-50 transition-all duration-300 border-r border-gray-100 last:border-r-0 overflow-hidden"
                >
                  <div
                    className="absolute top-4 right-4 text-[6rem] font-black leading-none select-none pointer-events-none"
                    style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.08 } as any}
                  >
                    01
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-6 relative z-10" style={{ backgroundColor: pc }}>
                    <Icon name="location" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight relative z-10">{addressCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-5 relative z-10">{school.address}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all duration-300 relative z-10" style={{ color: pc }}>
                    {addressCardAction} <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}

              {school.phone && (
                <a
                  href={`tel:${school.phone}`}
                  className="group relative p-10 lg:p-12 hover:bg-gray-50 transition-all duration-300 border-r border-gray-100 last:border-r-0 overflow-hidden"
                >
                  <div
                    className="absolute top-4 right-4 text-[6rem] font-black leading-none select-none pointer-events-none"
                    style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.08 } as any}
                  >
                    02
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-6 relative z-10" style={{ backgroundColor: pc }}>
                    <Icon name="phone" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight relative z-10">{phoneCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-5 relative z-10">{school.phone}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all duration-300 relative z-10" style={{ color: pc }}>
                    {phoneCardAction} <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}

              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="group relative p-10 lg:p-12 hover:bg-gray-50 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className="absolute top-4 right-4 text-[6rem] font-black leading-none select-none pointer-events-none"
                    style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.08 } as any}
                  >
                    03
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-6 relative z-10" style={{ backgroundColor: pc }}>
                    <Icon name="email" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight relative z-10">{emailCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-5 relative z-10">{school.email}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all duration-300 relative z-10" style={{ color: pc }}>
                    {emailCardAction} <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ OFFICE HOURS — SPLIT ═══════ */}
      <section className="bg-gray-50 px-6 py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{officeHoursBadge}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter mb-10">
              {officeHoursHeading}
            </h2>
            <div className="space-y-0">
              {officeHours.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                  <div>
                    <div className="font-bold text-gray-900">{h.day}</div>
                    {h.note && <div className="text-xs text-gray-400 mt-0.5 font-medium">{h.note}</div>}
                  </div>
                  <span className={`text-sm font-bold px-4 py-2 rounded-lg ${
                    h.time === 'Closed'
                      ? 'bg-red-50 text-red-500 border border-red-100'
                      : 'border'
                  }`}
                    style={h.time !== 'Closed' ? { color: pc, backgroundColor: `${pc}10`, borderColor: `${pc}20` } : undefined}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-8 leading-relaxed">{officeHoursAfterNote}</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <img src={officeHoursImage} alt="School campus" className="w-full h-[420px] object-cover" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-full h-full border-2 pointer-events-none" style={{ borderColor: `${pc}30` }} />
            <div className="absolute -bottom-8 left-8 bg-white border border-gray-100 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name="clock" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{responseTimeValue}</div>
                  <div className="text-xs text-gray-400 font-medium">{responseTimeLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY VISIT — BORDERED GRID ═══════ */}
      <section className="bg-white px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>{visitBadge}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter mb-4">{visitHeading}</h2>
            <p className="text-gray-500 text-lg max-w-2xl">{visitDescription}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-gray-100">
            {visitReasons.map((item, i) => (
              <div key={item.title} className={`relative p-8 group hover:bg-gray-50 transition-colors ${i < visitReasons.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <div
                  className="absolute top-3 right-3 text-[4rem] font-black leading-none select-none pointer-events-none"
                  style={{ WebkitTextStroke: `1px ${pc}`, color: 'transparent', opacity: 0.10 } as any}
                >
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-5 relative z-10" style={{ backgroundColor: pc }}>
                  <Icon name={item.iconName} className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-2 tracking-tight relative z-10">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
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
            <p className="text-white/60 text-sm uppercase tracking-widest">We look forward to hearing from you</p>
          </div>
        </div>
      </section>
    </>
  );
}
