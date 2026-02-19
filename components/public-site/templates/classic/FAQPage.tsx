import { useState } from 'react';
import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection, normalizeFaqs } from '../shared/section-helpers';
import { faqCategories as defaultFaqCategories, faqs as defaultFaqs } from '../shared/content';

export default function FAQPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const name = school.name || 'Our School';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const heroSec = getSection(sitePage, 'hero')
  const faqSec = getSection(sitePage, 'faq')
  const ctaSec = getSection(sitePage, 'cta')

  const hero = {
    badge: heroSec?.badge || 'Everything you need to know',
    headline: heroSec?.headline || 'Frequently asked',
    headlineSub: heroSec?.headlineSub || 'questions',
    description: heroSec?.description || `Find answers to common queries about ${name}'s admissions, academics, fees, and campus life.`,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1600&q=80',
  }

  const faqCategories = faqSec?.categories?.map((c: any) => ({
    name: c.name, iconName: c.iconName || c.icon || 'faqGeneral', color: c.color || pc,
  })) || defaultFaqCategories
  const activeFaqs = normalizeFaqs(faqSec?.faqs) || defaultFaqs

  const faqLabels = {
    allFilter: faqSec?.allFilterLabel || 'All Questions',
    browseAll: faqSec?.browseAllHeading || 'Browse all questions',
    countSuffix: faqSec?.countSuffix || 'Questions Answered',
    emptyTitle: faqSec?.emptyTitle || 'No questions in this category yet',
    emptyDesc: faqSec?.emptyDescription || 'Try browsing all questions instead',
    emptyButton: faqSec?.emptyButton || 'View all questions',
  }

  const cta = {
    badge: ctaSec?.badge || "We're here to help",
    headline: ctaSec?.headline || 'Still have\nquestions?',
    description: ctaSec?.description || "Can't find what you're looking for? Our team is happy to help with any questions about admissions, fees, or campus life.",
    buttons: ctaSec?.buttons || [
      { text: 'Contact Us', link: '/contact', variant: 'primary' },
      { text: 'View Admissions', link: '/admissions', variant: 'secondary' },
    ],
  }

  const toggle = (i: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const filtered = activeCategory ? activeFaqs.filter((f: any) => f.cat === activeCategory) : activeFaqs;

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
            <p className="text-xl text-white/50 max-w-lg leading-relaxed">
              {hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <section className="px-6 py-8 bg-white border-b border-gray-100 sticky top-16 z-40 backdrop-blur-xl bg-white/95">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeCategory === null
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={isActive ? { backgroundColor: cat.color } : undefined}
                >
                  <Icon name={cat.iconName} className="w-5 h-5" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ACCORDION ═══════ */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          {!activeCategory && (
            <div className="mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
                {activeFaqs.length} {faqLabels.countSuffix}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                {faqLabels.browseAll}
              </h2>
            </div>
          )}

          {activeCategory && (
            <div className="mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: faqCategories.find((c: any) => c.name === activeCategory)?.color, backgroundColor: `${faqCategories.find((c: any) => c.name === activeCategory)?.color}10` }}>
                {activeCategory}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                {filtered.length} question{filtered.length !== 1 ? 's' : ''} in this category
              </h2>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((faq: any) => {
              const globalIdx = activeFaqs.indexOf(faq);
              const isOpen = openIds.has(globalIdx);
              const catObj = faqCategories.find((c: any) => c.name === faq.cat);
              const borderColor = catObj?.color || pc;

              return (
                <div
                  key={globalIdx}
                  className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'bg-white shadow-xl shadow-gray-200/60 border-gray-200/80'
                      : 'bg-gray-50/80 hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 border-gray-100/80'
                  } border`}
                >
                  <button onClick={() => toggle(globalIdx)} className="w-full flex items-center gap-4 p-6 text-left">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isOpen ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                      }`}
                      style={{ backgroundColor: isOpen ? borderColor : `${borderColor}12`, color: isOpen ? 'white' : borderColor }}
                    >
                      <Icon name={catObj?.iconName || 'faqGeneral'} className="w-5 h-5" />
                    </div>
                    <span className="flex-1 font-bold text-gray-900 text-[15px] lg:text-base leading-snug">{faq.q}</span>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ backgroundColor: isOpen ? borderColor : '#F3F4F6', color: isOpen ? 'white' : '#9CA3AF' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pl-20 text-gray-500 leading-relaxed text-[15px]">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && activeCategory && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${pc}10` }}>
                <Icon name="faqGeneral" className="w-7 h-7" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">{faqLabels.emptyTitle}</p>
              <p className="text-gray-400 mb-4">{faqLabels.emptyDesc}</p>
              <button onClick={() => setActiveCategory(null)} className="text-sm font-bold hover:underline" style={{ color: pc }}>
                {faqLabels.emptyButton}
              </button>
            </div>
          )}
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
            {cta.buttons[0] && (
              <a
                href={cta.buttons[0].link}
                className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                style={{ color: pc }}
              >
                {cta.buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {cta.buttons[1] && (
              <a href={cta.buttons[1].link} className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                {cta.buttons[1].text}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
