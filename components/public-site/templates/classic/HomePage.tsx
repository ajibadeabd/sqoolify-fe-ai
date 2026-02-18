import type { PublicSchool } from '../../../../lib/types';

export default function HomePage({ school }: { school: PublicSchool }) {
  const pc = school.siteConfig?.primaryColor || '#1E3A5F';
  const name = school.name || 'Our School';

  return (
    <>
      {/* ═══════ HERO — SPLIT LAYOUT ═══════ */}
      <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: pc }}>
        {/* Decorative bg pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full opacity-[0.07] bg-white" />
          <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full opacity-[0.05] bg-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 min-h-screen items-center">
            {/* Left — Text */}
            <div className="pt-32 pb-12 lg:py-0 lg:pr-16">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-sm font-medium tracking-wide">Admissions Open — 2025/2026 Session</span>
              </div>
              <h1 className="text-[3.2rem] sm:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.05] tracking-tight mb-8">
                Shaping tomorrow's
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">leaders, today.</span>
              </h1>
              <p className="text-lg lg:text-xl text-white/60 max-w-lg leading-relaxed mb-12">
                {name} delivers an exceptional education built on academic rigour, character, and a commitment to every child's individual potential.
              </p>
              <div className="flex flex-wrap gap-4 mb-16 lg:mb-0">
                <a
                  href="/admissions"
                  className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
                  style={{ color: pc }}
                >
                  Start Application
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Our Story
                </a>
              </div>

              {/* Trust strip */}
              <div className="hidden lg:flex items-center gap-8 pt-12 border-t border-white/10">
                {[
                  { val: '20+', label: 'Years' },
                  { val: '2,000+', label: 'Students' },
                  { val: '98%', label: 'Pass Rate' },
                  { val: '50+', label: 'Teachers' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-white">{s.val}</div>
                    <div className="text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Photo grid */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 bg-white blur-3xl" />
              </div>
              <div className="relative grid grid-cols-2 gap-4 py-20">
                <div className="space-y-4 pt-12">
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 aspect-[3/4]">
                    <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80" alt="Campus" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 aspect-square">
                    <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" alt="Students" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 aspect-square">
                    <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" alt="Learning" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 aspect-[3/4]">
                    <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80" alt="Activities" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="lg:hidden px-6 pb-12">
          <div className="grid grid-cols-4 gap-4">
            {[
              { val: '20+', label: 'Years' },
              { val: '2k+', label: 'Students' },
              { val: '98%', label: 'Pass Rate' },
              { val: '50+', label: 'Teachers' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PILLARS — LARGE ICON CARDS ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              Why {name}
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
              An education designed for<br className="hidden sm:block" />
              <span style={{ color: pc }}>real-world success</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
              We go beyond textbooks. Every programme is built to develop critical thinkers, confident communicators, and compassionate leaders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                ),
                title: 'Academic Excellence',
                desc: 'A rigorous curriculum with outstanding WAEC and NECO results year after year. Our students don\'t just pass exams — they top them.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
                title: 'Modern STEM Labs',
                desc: 'Fully equipped science laboratories, robotics stations, computer suites, and a digital library that bring learning to life.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m4.894-1.228a8.966 8.966 0 0 0-4.894-1.228m0 0a24 24 0 0 1-4.773-1M7.73 9.728a24 24 0 0 0 4.773-1m-4.773 1a8.966 8.966 0 0 1-4.894-1.228" />
                  </svg>
                ),
                title: 'Sports & Arts',
                desc: 'Inter-house sports, swimming, football, basketball, drama, music, debate — because greatness extends far beyond the classroom.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                ),
                title: 'Expert Faculty',
                desc: 'Passionate, qualified educators who serve as mentors. Small class sizes mean every child receives personal attention and care.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: 'Safe Environment',
                desc: 'CCTV monitoring, 24/7 security, controlled access, on-site medical staff, and emergency protocols that give parents complete peace of mind.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                ),
                title: 'Parent Portal',
                desc: 'Real-time access to grades, attendance, fee payments, and announcements. Stay connected to your child\'s progress from anywhere.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative bg-gray-50/80 rounded-3xl p-8 lg:p-10 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/60 border border-gray-100/80 hover:border-gray-200/80 transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ backgroundColor: pc }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CAMPUS LIFE — BENTO GRID ═══════ */}
      <section className="px-6 py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}20` }}>
              Campus Life
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-white tracking-tight leading-[1.1] mb-5">
              More than a school —<br />a second home
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              From morning assembly to after-school clubs, every moment is an opportunity to grow, connect, and discover new passions.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-3 lg:gap-4 h-[500px] lg:h-[550px]">
            <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80" alt="Classroom" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: pc }}>Learning</span>
                <h3 className="text-xl font-bold text-white">Interactive Classrooms</h3>
                <p className="text-white/60 text-sm mt-1">Smart boards, small class sizes, and hands-on learning</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80" alt="Library" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h4 className="text-sm font-bold text-white">Library</h4>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" alt="Technology" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h4 className="text-sm font-bold text-white">Computer Lab</h4>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80" alt="Sports" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h4 className="text-sm font-bold text-white">Sports</h4>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative group" style={{ backgroundColor: pc }}>
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="text-3xl lg:text-4xl font-black text-white mb-1">15+</div>
                <div className="text-white/60 text-xs font-medium uppercase tracking-wider">Clubs & Activities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT STRIP — IMAGE + TEXT ═══════ */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Image stack */}
            <div className="lg:col-span-2 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"
                  alt="Students learning"
                  className="w-full h-[460px] object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 max-w-[220px] hidden sm:block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: pc }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347" /></svg>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">A+</div>
                    <div className="text-xs text-gray-400">Average Grade</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Rated by parents</p>
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-3 lg:pl-8">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ color: pc, backgroundColor: `${pc}10` }}>
                Our Story
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-black text-gray-900 tracking-tight leading-[1.15] mb-6">
                Building a legacy of excellence<br className="hidden lg:block" />
                <span style={{ color: pc }}>since day one</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                {name} was founded with a single mission: give every child access to an education that rivals the best in the world. What started as a small classroom has grown into one of the region's most respected institutions.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10">
                Our alumni include doctors, engineers, entrepreneurs, and community leaders. They are proof that when you combine passionate teaching with genuine care, extraordinary things happen.
              </p>

              {/* Key numbers */}
              <div className="grid grid-cols-3 gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                {[
                  { val: '20+', label: 'Years of Impact' },
                  { val: '5,000+', label: 'Graduates' },
                  { val: '100%', label: 'UTME Success' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-black tracking-tight" style={{ color: pc }}>{s.val}</div>
                    <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <a
                href="/about"
                className="group inline-flex items-center gap-2 mt-8 font-bold text-lg hover:gap-3 transition-all duration-300"
                style={{ color: pc }}
              >
                Read our full story
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS — FEATURED + GRID ═══════ */}
      <section className="px-6 py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: pc, backgroundColor: `${pc}10` }}>
              Testimonials
            </span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 tracking-tight leading-[1.1]">
              Trusted by families<br />across the community
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured testimonial */}
            <div className="lg:row-span-2 rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-[0.06] bg-white" />
              </div>
              <div className="relative">
                <div className="text-8xl font-serif leading-none opacity-20 mb-4">"</div>
                <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-10 -mt-8">
                  Enrolling my children here was the best decision we've ever made. The academic standards are world-class, but what truly sets this school apart is how deeply the teachers care about each student's growth as a human being.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    MA
                  </div>
                  <div>
                    <div className="font-bold text-lg">Mrs. Adebayo</div>
                    <div className="text-white/60 text-sm">Parent — 3 children enrolled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other testimonials */}
            {[
              { name: 'Emmanuel O.', role: 'SS3 Student, Class of 2024', initials: 'EO', quote: 'This school didn\'t just prepare me for WAEC — it prepared me for life. The mentorship, the leadership programmes, and the friendships I\'ve built here are truly priceless.' },
              { name: 'Dr. Okonkwo', role: 'Parent & Medical Professional', initials: 'DO', quote: 'As someone who holds very high standards, I can say with confidence that this school exceeds expectations in every area — academics, safety, facilities, and parent communication.' },
              { name: 'Mr. Chukwuma', role: 'Parent since 2019', initials: 'MC', quote: 'The transformation I\'ve seen in my son is remarkable. He\'s more confident, more disciplined, and genuinely excited about learning. The school deserves so much credit for that.' },
              { name: 'Aisha M.', role: 'JSS3 Student', initials: 'AM', quote: 'I love the science labs and the coding club! My teachers push me to be my best every single day, and I feel like I can achieve anything.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ADMISSIONS CTA ═══════ */}
      <section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: pc }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.08] bg-white" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05] bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Limited spaces available</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Your child's future<br />starts with a single step
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Join the families who have trusted {name} with their children's education. Applications for the new session are now open.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/admissions"
              className="group inline-flex items-center justify-center gap-3 bg-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
              style={{ color: pc }}
            >
              Begin Application
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              Talk to Admissions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
