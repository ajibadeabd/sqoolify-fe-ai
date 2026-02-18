import { useState } from 'react';
import type { PublicSchool } from '../../../../lib/types';

const CATEGORIES = [
  {
    name: 'Admissions',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    color: '#3A7D44',
  },
  {
    name: 'Academics',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>,
    color: '#2E5090',
  },
  {
    name: 'Campus Life',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
    color: '#0891B2',
  },
  {
    name: 'Fees & Policies',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>,
    color: '#7C3AED',
  },
  {
    name: 'General',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>,
    color: '#EA580C',
  },
];

const FAQS = [
  { q: 'How do I apply for admission?', a: 'Admissions are done online via our website or at our front office. Fill out the application form and submit the required documents including birth certificate, previous school reports, and passport photographs. Once reviewed, our admissions team will schedule an interview with you and your child.', cat: 'Admissions' },
  { q: 'What curriculum do you follow?', a: 'We follow the Nigerian curriculum augmented with international best practices to offer a well-rounded education that prepares students for both local and global opportunities. Our programme is enriched with STEM, arts, and leadership development.', cat: 'Academics' },
  { q: 'What age groups do you accept?', a: 'We accept students from Nursery to Secondary level, typically starting from age 3 to 18. Each level has specific entry requirements that will be shared during the admission process.', cat: 'Admissions' },
  { q: 'How are students assessed?', a: 'Students are assessed through continuous assessments and exams. We prioritize individual growth and development, using a combination of written tests, projects, practical evaluations, and class participation.', cat: 'Academics' },
  { q: 'What extracurricular activities are available?', a: 'We offer sports (football, basketball, athletics), arts (drama, music, visual arts), academic clubs (debate, science, coding), and community service opportunities to help students develop well-rounded skills.', cat: 'Campus Life' },
  { q: 'Is the campus secure?', a: 'Yes, our campus has 24/7 security personnel, CCTV surveillance, and secure access control at all entry points. We maintain a strict visitor policy and conduct regular safety drills. Student safety is our top priority.', cat: 'Campus Life' },
  { q: 'What documents are needed for enrollment?', a: 'You will need a birth certificate, previous school reports (if applicable), passport photographs, immunization records, and a completed application form. International students may need additional documentation.', cat: 'Admissions' },
  { q: 'Do you offer extra lessons or tutoring?', a: 'Yes, we offer after-school tutoring and extra lessons for students who need additional support. These sessions are coordinated with class teachers and are available at no extra cost for enrolled students.', cat: 'Academics' },
  { q: 'What are the school fees?', a: 'School fees vary by class level and include tuition, learning materials, and access to all standard facilities. Please contact our admissions office or visit our fees page for detailed fee structures and payment plans.', cat: 'Fees & Policies' },
  { q: 'Are there payment plans available?', a: 'Yes, we offer flexible payment plans including termly payments and installment options. Please speak with our accounts department for arrangements that suit your family\'s needs.', cat: 'Fees & Policies' },
  { q: 'What are the school hours?', a: 'School runs from 8:00 AM to 3:00 PM on weekdays. After-school activities and clubs run from 3:00 PM to 4:30 PM. The school bus departs at 3:15 PM and 4:45 PM.', cat: 'Campus Life' },
  { q: 'What is your refund policy?', a: 'Refund requests must be made within the first two weeks of the term. A processing fee may apply. Full details about our refund and withdrawal policies are available in our student handbook.', cat: 'Fees & Policies' },
  { q: 'How can I contact the school?', a: 'You can reach us through our website contact form, by phone during office hours (Monday\u2013Friday, 7:30 AM \u2013 4:00 PM), by email, or by visiting our campus. Our administrative staff are happy to assist.', cat: 'General' },
  { q: 'Do you provide school transportation?', a: 'Yes, we offer school bus services covering major routes within the city. Transportation fees are separate from tuition. Route details and schedules are available at the admin office.', cat: 'General' },
  { q: 'Is there a school uniform?', a: 'Yes, all students are required to wear the official school uniform. Uniforms can be purchased from our school store. Details about the dress code are provided during the enrollment process.', cat: 'General' },
];

export default function FAQPage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const filtered = activeCategory ? FAQS.filter((f) => f.cat === activeCategory) : FAQS;

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1600&q=80"
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
              <span className="text-white/90 text-sm font-medium tracking-wide">Everything you need to know</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Frequently asked
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">questions</span>
            </h1>
            <p className="text-xl text-white/50 max-w-lg leading-relaxed">
              Find answers to common queries about our school, admissions process, fees, and campus life.
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
              All Questions
            </button>
            {CATEGORIES.map((cat) => {
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
                  {cat.icon}
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
                {FAQS.length} Questions Answered
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Browse all questions
              </h2>
            </div>
          )}

          {activeCategory && (
            <div className="mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: CATEGORIES.find(c => c.name === activeCategory)?.color, backgroundColor: `${CATEGORIES.find(c => c.name === activeCategory)?.color}10` }}>
                {activeCategory}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                {filtered.length} question{filtered.length !== 1 ? 's' : ''} in this category
              </h2>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((faq) => {
              const globalIdx = FAQS.indexOf(faq);
              const isOpen = openIds.has(globalIdx);
              const catObj = CATEGORIES.find((c) => c.name === faq.cat);
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
                      {catObj?.icon}
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
                <svg className="w-7 h-7" style={{ color: pc }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No questions in this category yet</p>
              <p className="text-gray-400 mb-4">Try browsing all questions instead</p>
              <button onClick={() => setActiveCategory(null)} className="text-sm font-bold hover:underline" style={{ color: pc }}>
                View all questions
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
            <span className="text-white/80 text-sm font-medium">We're here to help</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Still have<br />questions?
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Can't find what you're looking for? Our team is happy to help with any questions about admissions, fees, or campus life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
              style={{ color: pc }}
            >
              Contact Us
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/admissions" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
              View Admissions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
