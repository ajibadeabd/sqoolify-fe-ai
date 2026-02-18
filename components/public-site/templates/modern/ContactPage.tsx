import type { PublicSchool } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { contactHeroContent, officeHours, visitReasons, contactCtaContent } from '../shared/content';

export default function ContactPage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';
  const hero = contactHeroContent();
  const cta = contactCtaContent(name);

  const contactInfo = [
    ...(school.address ? [{ icon: 'location', label: 'Visit Us', value: school.address }] : []),
    ...(school.phone ? [{ icon: 'phone', label: 'Call Us', value: school.phone }] : []),
    ...(school.email ? [{ icon: 'email', label: 'Email Us', value: school.email }] : []),
  ];

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.05]" style={{ background: `radial-gradient(circle, ${pc}, transparent 70%)` }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-8">
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

      {/* ═══════ CONTACT CARDS ═══════ */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((c) => (
              <div key={c.icon} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
                  <Icon name={c.icon} className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.label}</h3>
                <p className="text-gray-500 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OFFICE HOURS ═══════ */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Office Hours</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">When to reach us</h2>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                {officeHours.map((oh, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-5 ${i < officeHours.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div>
                      <div className="font-semibold text-gray-900">{oh.day}</div>
                      {oh.note && <div className="text-xs text-gray-400 mt-0.5">{oh.note}</div>}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{oh.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-xl border border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pc}10`, color: pc }}>
                    <Icon name="clock" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Average Response Time</div>
                    <div className="text-gray-500 text-sm">Within 2 business hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Visit */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: pc }}>Plan A Visit</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Why visit our campus</h2>
              <div className="space-y-4">
                {visitReasons.map((r) => (
                  <div key={r.title} className="bg-white rounded-xl p-5 border border-gray-100 flex gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${pc}10`, color: pc }}>
                      <Icon name={r.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{r.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                    </div>
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
                <span className="text-white/80 text-sm">{cta.badge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-5 whitespace-pre-line">{cta.headline}</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-10">{cta.description}</p>
              <a href="/admissions" className="group inline-flex items-center justify-center gap-2.5 bg-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all" style={{ color: pc }}>
                Start Application
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
