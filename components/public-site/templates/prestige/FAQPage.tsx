import { useState } from 'react';
import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection, normalizeFaqs } from '../shared/section-helpers';
import { faqCategories as defaultFaqCategories, faqs as defaultFaqs } from '../shared/content';

export default function FAQPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#23b864';
  const name = school.name || 'Our School';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const heroSec = getSection(sitePage, 'hero');
  const faqSec = getSection(sitePage, 'faq');
  const ctaSec = getSection(sitePage, 'cta');

  const hero = {
    badge: heroSec?.badge || 'Everything you need to know',
    headline: heroSec?.headline || 'Frequently asked',
    headlineSub: heroSec?.headlineSub || 'questions',
    description: heroSec?.description || `Find answers to common queries about ${name}'s admissions, academics, fees, and campus life.`,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1200&q=80',
  };

  const faqCategories = faqSec?.categories?.map((c: any) => ({
    name: c.name, iconName: c.iconName || c.icon || 'faqGeneral', color: c.color || pc,
  })) || defaultFaqCategories;
  const activeFaqs = normalizeFaqs(faqSec?.faqs) || defaultFaqs;

  const faqLabels = {
    allFilter: faqSec?.allFilterLabel || 'All Questions',
    browseAll: faqSec?.browseAllHeading || 'Browse all questions',
    countSuffix: faqSec?.countSuffix || 'Questions Answered',
    emptyTitle: faqSec?.emptyTitle || 'No questions in this category yet',
    emptyDesc: faqSec?.emptyDescription || 'Try browsing all questions instead',
    emptyButton: faqSec?.emptyButton || 'View all questions',
  };

  const cta = {
    badge: ctaSec?.badge || "We're here to help",
    headline: ctaSec?.headline || "Still have\nquestions?",
    description: ctaSec?.description || "Can't find what you're looking for? Our team is happy to help.",
    buttons: ctaSec?.buttons || [
      { text: 'Contact Us', link: '/contact', variant: 'primary' },
      { text: 'View Admissions', link: '/admissions', variant: 'secondary' },
    ],
  };

  const toggle = (i: number) => {
    setOpenIds((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  };

  const filtered = activeCategory ? activeFaqs.filter((f: any) => f.cat === activeCategory) : activeFaqs;

  return (
    <>
      {/* ═══════ HERO — SPLIT ═══════ */}
      <section className="flex flex-col lg:flex-row min-h-[85vh] overflow-hidden">
        <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 sm:px-12 lg:px-20 pt-32 pb-16 lg:py-0">
          <div className="absolute left-0 top-32 bottom-32 w-[3px] hidden lg:block" style={{ backgroundColor: pc }} />
          <div className="lg:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-8 block" style={{ color: pc }}>04 / FAQ</span>
            <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-8">
              {hero.headline}
              <span className="block" style={{ color: pc }}>{hero.headlineSub}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed">{hero.description}</p>
          </div>
        </div>
        <div className="w-full lg:w-[48%] relative min-h-[55vw] lg:min-h-0">
          <img src={hero.heroImage} alt="Students" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER — STICKY ═══════ */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-40 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeCategory === null ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={activeCategory === null ? { backgroundColor: pc } : undefined}
          >
            {faqLabels.allFilter}
          </button>
          {faqCategories.map((cat: any) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(isActive ? null : cat.name)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${isActive ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={isActive ? { backgroundColor: cat.color } : undefined}
              >
                <Icon name={cat.iconName} className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════ FAQ ACCORDION ═══════ */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] mb-4 block" style={{ color: pc }}>
              {activeCategory || `${activeFaqs.length} ${faqLabels.countSuffix}`}
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter">
              {activeCategory ? `${filtered.length} question${filtered.length !== 1 ? 's' : ''} in this category` : faqLabels.browseAll}
            </h2>
          </div>

          <div className="space-y-3">
            {filtered.map((faq: any) => {
              const globalIdx = activeFaqs.indexOf(faq);
              const isOpen = openIds.has(globalIdx);
              const catObj = faqCategories.find((c: any) => c.name === faq.cat);
              const borderColor = catObj?.color || pc;

              return (
                <div
                  key={globalIdx}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 ${isOpen ? 'bg-white shadow-lg border-gray-200' : 'bg-gray-50 hover:bg-white hover:shadow-md border-gray-100'}`}
                >
                  <button onClick={() => toggle(globalIdx)} className="w-full flex items-center gap-4 p-6 text-left">
                    <div
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300"
                      style={{ backgroundColor: isOpen ? borderColor : `${borderColor}15`, color: isOpen ? 'white' : borderColor }}
                    >
                      <Icon name={catObj?.iconName || 'faqGeneral'} className="w-4 h-4" />
                    </div>
                    <span className="flex-1 font-bold text-gray-900 text-[15px] leading-snug">{faq.q}</span>
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ backgroundColor: isOpen ? borderColor : '#F3F4F6', color: isOpen ? 'white' : '#9CA3AF' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pl-[4.25rem] text-gray-500 leading-relaxed text-[15px]">{faq.a}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && activeCategory && (
            <div className="text-center py-20">
              <p className="text-lg font-bold text-gray-900 mb-1">{faqLabels.emptyTitle}</p>
              <p className="text-gray-400 mb-4">{faqLabels.emptyDesc}</p>
              <button onClick={() => setActiveCategory(null)} className="text-sm font-bold hover:underline" style={{ color: pc }}>{faqLabels.emptyButton}</button>
            </div>
          )}
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
              {cta.buttons.map((btn: any, i: number) =>
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
            <p className="text-white/60 text-sm uppercase tracking-widest">Our team is here for you</p>
          </div>
        </div>
      </section>
    </>
  );
}
