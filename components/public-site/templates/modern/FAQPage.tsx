import { useState } from 'react';
import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { getSection, normalizeFaqs } from '../shared/section-helpers';
import { faqCategories as defaultFaqCategories, faqs as defaultFaqs } from '../shared/content';

export default function FAQPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const name = school.name || 'Our School';
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const heroSec = getSection(sitePage, 'hero')
  const faqSec = getSection(sitePage, 'faq')
  const ctaSec = getSection(sitePage, 'cta')

  const hero = {
    badge: heroSec?.badge || 'Help Centre',
    headline: heroSec?.headline || 'Frequently asked',
    headlineSub: heroSec?.headlineSub || 'questions',
    description: heroSec?.description || `Find answers to common questions about ${name}'s admissions, academics, fees, and campus life.`,
  }

  const faqCategories = faqSec?.categories?.map((c: any) => ({
    name: c.name, iconName: c.iconName || c.icon || 'faqGeneral', color: c.color || pc,
  })) || defaultFaqCategories
  const faqs = normalizeFaqs(faqSec?.faqs) || defaultFaqs
  const allFilterLabel = faqSec?.allFilterLabel || 'All'
  const emptyText = faqSec?.emptyTitle || 'No questions found in this category.'

  const cta = {
    headline: ctaSec?.headline || 'Still have questions?',
    description: ctaSec?.description || "Can't find what you're looking for? Our admissions team is happy to help.",
    buttons: ctaSec?.buttons || [
      { text: 'Contact Us', link: '/contact', variant: 'primary' },
    ],
  }

  const filtered = activeCategory === 'All' ? faqs : faqs.filter((f) => f.cat === activeCategory);

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
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${pc}, ${pc}99)` }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            {hero.description}
          </p>
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <section className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('All')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'All'
                  ? 'text-white shadow-md'
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
              }`}
              style={activeCategory === 'All' ? { backgroundColor: pc } : {}}
            >
              {allFilterLabel}
            </button>
            {faqCategories.map((cat: any) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.name
                    ? 'text-white shadow-md'
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
                style={activeCategory === cat.name ? { backgroundColor: pc } : {}}
              >
                <Icon name={cat.iconName} className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ LIST ═══════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              const cat = faqCategories.find((c: any) => c.name === faq.cat);
              return (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat?.color || pc}12`, color: cat?.color || pc }}>
                      <Icon name={cat?.iconName || 'faqGeneral'} className="w-4.5 h-4.5" />
                    </div>
                    <span className="flex-1 font-semibold text-gray-900">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pl-[4.25rem]">
                      <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400">{emptyText}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ CONTACT CTA ═══════ */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-10 border border-gray-100">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: `${pc}10`, color: pc }}>
              <Icon name="askQuestions" className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{cta.headline}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {cta.description}
            </p>
            {cta.buttons[0] && (
              <a
                href={cta.buttons[0].link}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold hover:shadow-lg transition-all"
                style={{ backgroundColor: pc }}
              >
                {cta.buttons[0].text}
                <Icon name="arrowRight" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
