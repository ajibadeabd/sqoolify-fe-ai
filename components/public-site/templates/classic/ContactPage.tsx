import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  contactHeroContent, contactCtaContent,
  officeHours as defaultOfficeHours, visitReasons as defaultVisitReasons,
} from '../shared/content';

export default function ContactPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const name = school.name || 'Our School';
  const hasContact = school.address || school.phone || school.email;

  const heroSec = getSection(sitePage, 'hero')
  const contactSec = getSection(sitePage, 'contact')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = contactHeroContent()
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
  }

  const _dc = contactCtaContent(name)
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || _dc.headline,
    description: ctaSec?.description || _dc.description,
  }

  const contactCardsBadge = contactSec?.contactCardsBadge || 'Reach Us'
  const contactCardsHeading = contactSec?.contactCardsHeading || 'Multiple ways to connect with us'
  const officeHoursBadge = contactSec?.officeHoursBadge || 'Office Hours'
  const officeHoursHeading = contactSec?.officeHoursHeading || 'When you can reach us'
  const officeHoursAfterNote = contactSec?.officeHoursAfterNote || 'For urgent matters outside office hours, please send us an email and we will respond on the next business day.'
  const responseTimeValue = contactSec?.responseTimeValue || '<24h'
  const responseTimeLabel = contactSec?.responseTimeLabel || 'Avg. response time'
  const visitBadge = contactSec?.visitBadge || 'Visit Our Campus'
  const visitHeading = contactSec?.visitHeading || 'Come see what makes us special'
  const visitDescription = contactSec?.visitDescription || 'Schedule a campus visit and experience our learning environment firsthand.'
  const officeHoursImage = contactSec?.officeHoursImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80'
  const heroButtonText = heroSec?.buttonText || contactSec?.heroButtonText || 'Call us now'
  const addressCardTitle = contactSec?.addressCardTitle || 'Visit Our Campus'
  const addressCardAction = contactSec?.addressCardAction || 'Get directions'
  const phoneCardTitle = contactSec?.phoneCardTitle || 'Call Us'
  const phoneCardAction = contactSec?.phoneCardAction || 'Call now'
  const emailCardTitle = contactSec?.emailCardTitle || 'Email Us'
  const emailCardAction = contactSec?.emailCardAction || 'Send email'

  const ctaButtons: { text: string; link: string; variant: string }[] = ctaSec?.buttons || [
    { text: 'View Admissions', link: '/admissions', variant: 'primary' },
    { text: 'Back to Home', link: '/', variant: 'secondary' },
  ]

  const officeHours: { day: string; time: string; note?: string }[] = contactSec?.officeHours || defaultOfficeHours
  const visitReasons: { title: string; desc: string; iconName: string }[] = contactSec?.visitReasons || defaultVisitReasons

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0">
          <img
            src={hero.heroImage}
            alt="School building"
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
            {school.phone && (
              <a
                href={`tel:${school.phone}`}
                className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                style={{ color: pc }}
              >
                {heroButtonText}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT CARDS ═══════ */}
      {hasContact && (
        <section className="px-6 py-28 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
                {contactCardsBadge}
              </span>
              <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1] whitespace-pre-line">
                {contactCardsHeading}
              </h2>
            </div>

            <div className={`grid gap-5 ${[school.address, school.phone, school.email].filter(Boolean).length === 3 ? 'lg:grid-cols-3' : [school.address, school.phone, school.email].filter(Boolean).length === 2 ? 'md:grid-cols-2' : ''}`}>
              {school.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(school.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gray-50/80 rounded-3xl p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3" style={{ backgroundColor: pc }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                    <Icon name="location" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">{addressCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{school.address}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all duration-300" style={{ color: pc }}>
                    {addressCardAction}
                    <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}

              {school.phone && (
                <a
                  href={`tel:${school.phone}`}
                  className="group relative bg-gray-50/80 rounded-3xl p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3" style={{ backgroundColor: pc }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                    <Icon name="phone" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">{phoneCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{school.phone}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all duration-300" style={{ color: pc }}>
                    {phoneCardAction}
                    <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}

              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="group relative bg-gray-50/80 rounded-3xl p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] -translate-y-1/3 translate-x-1/3" style={{ backgroundColor: pc }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                    <Icon name="email" className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">{emailCardTitle}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{school.email}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all duration-300" style={{ color: pc }}>
                    {emailCardAction}
                    <Icon name="arrowRight" className="w-4 h-4" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ OFFICE HOURS — DARK SECTION ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}20` }}>
                {officeHoursBadge}
              </span>
              <h2 className="text-4xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.1] mb-10">
                {officeHoursHeading.includes('\n') ? officeHoursHeading.split('\n').map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>) : officeHoursHeading}
              </h2>

              <div className="space-y-0">
                {officeHours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-white/10 last:border-0">
                    <div>
                      <div className="font-bold text-white text-lg">{h.day}</div>
                      {h.note && <div className="text-xs text-gray-500 mt-1 font-medium">{h.note}</div>}
                    </div>
                    <span className={`text-sm font-bold px-4 py-2 rounded-xl ${
                      h.time === 'Closed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-gray-500 text-sm mt-8 leading-relaxed">
                {officeHoursAfterNote}
              </p>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5">
                <img
                  src={officeHoursImage}
                  alt="School campus"
                  className="w-full h-[420px] object-cover"
                />
              </div>
              {/* Floating response time card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-2xl shadow-black/20 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pc}10`, color: pc }}>
                    <Icon name="clock" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">{responseTimeValue}</div>
                    <div className="text-xs text-gray-500 font-medium">{responseTimeLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY VISIT US ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              {visitBadge}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
              {visitHeading}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {visitDescription}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visitReasons.map((item) => (
              <div key={item.title} className="group bg-gray-50/80 rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: pc }}>
                  <Icon name={item.iconName} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
                <a
                  key={i}
                  href={btn.link}
                  className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                  style={{ color: pc }}
                >
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
