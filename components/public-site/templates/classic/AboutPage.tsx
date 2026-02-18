import type { PublicSchool } from '../../../../lib/types';

export default function AboutPage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const name = school.name || 'Our School';

  return (
    <>
      {/* ═══════ HERO — FULL BLEED WITH FLOATING STATS ═══════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80"
            alt="School campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05] bg-white" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-40">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
                <span className="text-white/90 text-sm font-medium tracking-wide">Est. 2005</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
                The story
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">behind {name}</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg leading-relaxed">
                Two decades of shaping futures, building character, and proving that every child can achieve extraordinary things.
              </p>
            </div>

            {/* Floating stats card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 lg:p-10">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { val: '20+', label: 'Years' },
                  { val: '5,000+', label: 'Alumni' },
                  { val: '98%', label: 'Pass Rate' },
                  { val: '50+', label: 'Faculty' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl lg:text-4xl font-black text-white">{s.val}</div>
                    <div className="text-sm text-white/40 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ORIGIN STORY — TIMELINE STYLE ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Sticky image column */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
                  alt="Students in classroom"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="mt-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: pc }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Accredited Institution</div>
                    <div className="text-sm text-gray-400">Approved by the Federal Ministry of Education</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story text */}
            <div className="lg:col-span-3">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}10` }}>
                Our Story
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-gray-900 tracking-tight leading-[1.15] mb-10">
                From a single classroom to a<br className="hidden lg:block" />
                <span style={{ color: pc }}>centre of excellence</span>
              </h2>

              <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-gray-100">
                  <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pc }} />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">The Beginning</h3>
                  <p className="text-gray-500 leading-relaxed">
                    {name} was born from a simple conviction: that every child, regardless of background, deserves access to an education that unlocks their full potential. Our founders started with a small classroom, a handful of students, and an unwavering vision.
                  </p>
                </div>
                <div className="relative pl-8 border-l-2 border-gray-100">
                  <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pc }} />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Growth & Investment</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Over the years, we invested relentlessly in what matters — outstanding teachers, modern laboratories, a well-stocked library, smart classrooms, and sports facilities. We grew not just in size, but in the depth and quality of education we provide.
                  </p>
                </div>
                <div className="relative pl-8 border-l-2 border-gray-100">
                  <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: pc }} />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Today & Beyond</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Today, our alumni include doctors, engineers, entrepreneurs, lawyers, and public servants across Nigeria and abroad. They are living proof that the right education changes everything. And we're just getting started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION ═══════ */}
      <section className="px-6 py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Mission — filled card */}
            <div className="relative rounded-3xl p-10 lg:p-14 text-white overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.06] bg-white" />
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-8">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Our Mission</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  To deliver a holistic, world-class education that nurtures intellectual curiosity, builds strong character, and empowers every student to reach their full potential — preparing them not just for exams, but for life.
                </p>
              </div>
            </div>

            {/* Vision — outlined card */}
            <div className="relative rounded-3xl p-10 lg:p-14 bg-white border border-gray-200 overflow-hidden">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: `${pc}10` }}>
                <svg className="w-7 h-7" style={{ color: pc }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Our Vision</h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                To be the leading educational institution in the region — recognized for academic excellence, innovative teaching, and producing graduates who are confident, compassionate, and equipped to lead in a rapidly changing world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CORE VALUES ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              What We Stand For
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1]">
              Six values that shape<br />
              <span style={{ color: pc }}>everything we do</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Excellence',
                desc: 'We chase the highest standards in academics, sports, and character. Good enough is never enough — outstanding is our baseline.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
              },
              {
                title: 'Integrity',
                desc: 'Honesty and responsibility are non-negotiable. We teach students to do the right thing — even when nobody is watching.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
              },
              {
                title: 'Innovation',
                desc: 'We embrace modern teaching methods, technology integration, and creative problem-solving to keep education dynamic and relevant.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
              },
              {
                title: 'Compassion',
                desc: 'Every child matters. We foster a warm, inclusive culture where students feel seen, valued, and supported by their peers and teachers.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
              },
              {
                title: 'Lifelong Learning',
                desc: 'We spark a passion for knowledge that outlasts any syllabus. Our graduates leave as curious, self-driven learners ready for the world.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
              },
              {
                title: 'Community',
                desc: 'Parents, teachers, and students form a strong partnership. Together we create a network that uplifts and empowers everyone within it.',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
              },
            ].map((v) => (
              <div
                key={v.title}
                className="group bg-gray-50/80 rounded-3xl p-8 lg:p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ backgroundColor: pc }}
                >
                  {v.icon}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ OUR APPROACH — DARK SECTION ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}20` }}>
                How We Teach
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-white tracking-tight leading-[1.15] mb-10">
                An approach built around<br />
                <span style={{ color: pc, filter: 'brightness(1.5)' }}>your child's success</span>
              </h2>

              <div className="space-y-5">
                {[
                  { title: 'Small Class Sizes', desc: 'Maximum 25 students per class ensures every child gets personal attention.' },
                  { title: 'Enriched Curriculum', desc: 'Nigerian syllabus enhanced with STEM, coding, arts, and leadership programmes.' },
                  { title: 'Character Education', desc: 'Weekly assemblies, mentorship, and community service build integrity and resilience.' },
                  { title: 'Parent Partnership', desc: 'Real-time digital portal, termly meetings, and open-door communication policy.' },
                  { title: 'Continuous Assessment', desc: 'Regular evaluations through projects, tests, practicals, and class participation.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ backgroundColor: pc }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">{item.title}</div>
                      <div className="text-gray-400 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80"
                  alt="Teaching approach"
                  className="w-full h-[550px] object-cover"
                />
              </div>
              {/* Floating quote */}
              <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-white rounded-2xl shadow-xl p-6 max-w-[280px] hidden sm:block">
                <p className="text-gray-600 text-sm leading-relaxed italic mb-3">
                  "The teachers here don't just teach — they inspire. My daughter looks forward to school every single morning."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: pc }}>AO</div>
                  <div className="text-xs text-gray-400 font-medium">Parent Testimonial</div>
                </div>
              </div>
            </div>
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Come see what makes<br />us different
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Words and photos can only say so much. Visit our campus, meet our teachers, watch our students in action — and experience the {name} difference for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
              style={{ color: pc }}
            >
              Schedule a Visit
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              View Admissions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
