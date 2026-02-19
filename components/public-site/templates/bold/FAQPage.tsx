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
    description: heroSec?.description || `Find answers about ${name}'s admissions, academics, fees, and campus life.`,
    heroImage: heroSec?.heroImage || 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1600&q=80',
  }

  const faqCategories = faqSec?.categories?.map((c: any) => ({
    name: c.name, iconName: c.iconName || c.icon || 'faqGeneral', color: c.color || pc,
  })) || defaultFaqCategories
  const faqs = normalizeFaqs(faqSec?.faqs) || defaultFaqs
  const allFilterLabel = faqSec?.allFilterLabel || 'All'
  const emptyText = faqSec?.emptyTitle || 'No questions found in this category.'

  const cta = {
    headline: ctaSec?.headline || 'Still have questions?',
    description: ctaSec?.description || "Can't find what you're looking for? Our admissions team is here to help.",
    buttons: ctaSec?.buttons || [
      { text: 'Contact Us', link: '/contact', variant: 'primary' },
    ],
  }

  const filtered = activeCategory === 'All' ? faqs : faqs.filter((f) => f.cat === activeCategory);

  return (
    <>
      {/* ═══════ HERO — FULL-BLEED ═══════ */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <img src={hero.heroImage} alt="FAQ" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{hero.badge}</p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase max-w-4xl">
            {hero.headline}{' '}
            <span style={{ color: pc }}>{hero.headlineSub}</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed mt-6">
            {hero.description}
          </p>
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <section className="sticky top-0 z-20 bg-gray-950 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('All')}
              className={`shrink-0 px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                activeCategory === 'All' ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}
              style={activeCategory === 'All' ? { backgroundColor: pc } : {}}
            >
              {allFilterLabel}
            </button>
            {faqCategories.map((cat: any) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat.name ? 'text-white' : 'text-gray-500 hover:text-white'
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
      <section className="bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-0">
            {filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              const cat = faqCategories.find((c: any) => c.name === faq.cat);
              return (
                <div key={i} className="border-b-2 border-gray-100 last:border-b-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center gap-5 py-6 text-left group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat?.color || pc}15`, color: cat?.color || pc }}>
                      <Icon name={cat?.iconName || 'faqGeneral'} className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-lg font-bold text-gray-900 group-hover:text-gray-700">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="pb-6 pl-[3.75rem]">
                      <p className="text-gray-500 leading-relaxed text-lg">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">{emptyText}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ CONTACT CTA ═══════ */}
      <section className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6 whitespace-pre-line">
            {cta.headline}
          </h3>
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
            {cta.description}
          </p>
          {cta.buttons[0] && (
            <a
              href={cta.buttons[0].link}
              className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ backgroundColor: pc, color: '#fff' }}
            >
              {cta.buttons[0].text}
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </section>
    </>
  );
}
