import { useState, useMemo } from 'react';
import type { FAQSectionContent, FAQCategory, PublicSchool } from '../../../lib/types';

const DEFAULT_COLORS = ['#2E5090', '#3A7D44', '#0891B2', '#7C3AED', '#EA580C', '#DC2626'];

export default function FAQSection({
  content,
  school,
}: {
  content: FAQSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#2E5090';
  const faqs = content.faqs || [];
  const categories = content.categories || [];
  const hasCategories = categories.length > 0 && faqs.some((f) => f.category);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const categoryMap = useMemo(() => {
    const map: Record<string, FAQCategory> = {};
    categories.forEach((c, i) => {
      map[c.name] = { ...c, color: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] };
    });
    return map;
  }, [categories]);

  const filteredFaqs = useMemo(() => {
    if (!activeCategory) return faqs;
    return faqs.filter((f) => f.category === activeCategory);
  }, [faqs, activeCategory]);

  if (faqs.length === 0) return null;

  const getCategoryColor = (catName?: string) => {
    if (!catName || !categoryMap[catName]) return primaryColor;
    return categoryMap[catName].color || primaryColor;
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />

      {/* Faded campus background image at bottom */}
      {content.backgroundImage && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2/5 bg-cover bg-center"
          style={{
            backgroundImage: `url(${content.backgroundImage})`,
            filter: 'blur(3px)',
            opacity: 0.1,
            maskImage: 'linear-gradient(to bottom, transparent, black 40%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%)',
          }}
        />
      )}

      <div className="relative px-6 py-20 lg:py-28">
        <div className="max-w-5xl mx-auto">

          {/* Category Filter Tabs — flat icon + label style */}
          {hasCategories && (
            <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-14">
              {categories.map((cat) => {
                const color = categoryMap[cat.name]?.color || primaryColor;
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(isActive ? null : cat.name)}
                    className={`flex items-center gap-2.5 group transition-all duration-200 ${
                      isActive ? 'scale-105' : ''
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'shadow-lg ring-2 ring-offset-2'
                          : 'group-hover:scale-105 group-hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: isActive ? color : `${color}18`,
                        color: isActive ? 'white' : color,
                        outlineColor: isActive ? color : undefined,
                      }}
                    >
                      {cat.icon || '📁'}
                    </div>
                    <span
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        isActive ? '' : 'text-gray-700 group-hover:text-gray-900'
                      }`}
                      style={isActive ? { color } : undefined}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* FAQ Cards — 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {filteredFaqs.map((faq, i) => {
              const globalIndex = faqs.indexOf(faq);
              const isOpen = openIds.has(globalIndex);
              const borderColor = getCategoryColor(faq.category);

              return (
                <div
                  key={globalIndex}
                  className={`bg-white rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    borderLeft: `4px solid ${borderColor}`,
                    border: `1px solid ${isOpen ? borderColor + '40' : '#E5E7EB'}`,
                    borderLeftWidth: '4px',
                    borderLeftColor: borderColor,
                  }}
                >
                  <button
                    onClick={() => toggle(globalIndex)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-bold text-gray-800 pr-4 text-[15px] leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      style={{
                        backgroundColor: isOpen ? borderColor : '#F3F4F6',
                        color: isOpen ? 'white' : '#9CA3AF',
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 text-gray-500 leading-relaxed text-[15px] border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state when filtering */}
          {filteredFaqs.length === 0 && activeCategory && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🤔</div>
              <p className="text-lg font-medium">No questions in this category yet.</p>
              <button
                onClick={() => setActiveCategory(null)}
                className="mt-3 text-sm font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                View all questions
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
