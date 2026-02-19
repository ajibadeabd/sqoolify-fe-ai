import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection } from '../shared/section-helpers';
import {
  contactHeroContent, officeHours as defaultOfficeHours,
  visitReasons as defaultVisitReasons, contactCtaContent, images,
} from '../shared/content';

export default function ContactPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';

  const heroSec = getSection(sitePage, 'hero')
  const ctaSec = getSection(sitePage, 'cta')

  const _dh = contactHeroContent()
  const hero = {
    badge: heroSec?.badge || heroSec?.title || _dh.badge,
    headline: heroSec?.headline || _dh.headline,
    headlineSub: heroSec?.headlineSub || _dh.headlineSub,
    description: heroSec?.description || heroSec?.subtitle || _dh.description,
  }

  const officeHours = defaultOfficeHours
  const visitReasons = defaultVisitReasons

  const _dc = contactCtaContent(name)
  const cta = {
    badge: ctaSec?.badge || ctaSec?.title || _dc.badge,
    headline: ctaSec?.headline || ctaSec?.title || _dc.headline,
    description: ctaSec?.description || _dc.description,
  };

  const contactInfo = [
    ...(school.address ? [{ icon: 'location', label: 'Visit Us', value: school.address }] : []),
    ...(school.phone ? [{ icon: 'phone', label: 'Call Us', value: school.phone }] : []),
    ...(school.email ? [{ icon: 'email', label: 'Email Us', value: school.email }] : []),
  ];

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED ═══════ */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <img src={images.contactHero} alt="Contact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <span className="text-white/90 text-sm font-bold uppercase tracking-wider">{hero.badge}</span>
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase max-w-4xl">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed mt-6">{hero.description}</p>
        </div>
      </section>

      {/* ═══════ CONTACT CARDS ═══════ */}
      {contactInfo.length > 0 && (
        <section className="bg-gray-950">
          <div className="max-w-7xl mx-auto px-6 py-28">
            <div className={`grid gap-px bg-white/10 ${contactInfo.length === 3 ? 'md:grid-cols-3' : contactInfo.length === 2 ? 'md:grid-cols-2' : ''}`}>
              {contactInfo.map((c) => (
                <div key={c.icon} className="bg-gray-950 p-10 hover:bg-gray-900 transition-colors group text-center">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center mb-6 border-2 group-hover:border-transparent group-hover:bg-white/10 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                    <Icon name={c.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">{c.label}</h3>
                  <p className="text-gray-400">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ OFFICE HOURS + WHY VISIT ═══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Office Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Office Hours</p>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase mb-10">
                When to reach us
              </h2>

              <div className="space-y-0">
                {officeHours.map((oh, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b-2 border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-black text-gray-900 uppercase tracking-wide">{oh.day}</div>
                      {oh.note && <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">{oh.note}</div>}
                    </div>
                    <span className="font-bold text-gray-600">{oh.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 border-2 border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: pc }}>
                  <Icon name="clock" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-black text-gray-900 uppercase tracking-wide text-sm">Average Response Time</div>
                  <div className="text-gray-500">Within 2 business hours</div>
                </div>
              </div>
            </div>

            {/* Why Visit */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>Plan A Visit</p>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase mb-10">
                Why visit us
              </h2>

              <div className="space-y-0">
                {visitReasons.map((r) => (
                  <div key={r.title} className="flex gap-5 py-6 border-b-2 border-gray-100 last:border-b-0 group">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0 border-2 group-hover:border-transparent group-hover:bg-gray-100 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                      <Icon name={r.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-wide mb-1">{r.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA — FULL-BLEED ═══════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={images.contactOfficeHours} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <span className="text-white/80 text-sm font-bold uppercase tracking-wider">{cta.badge}</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">{cta.headline}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{cta.description}</p>
          <a
            href="/admissions"
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
            style={{ backgroundColor: pc, color: '#fff' }}
          >
            Start Application
            <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </>
  );
}
