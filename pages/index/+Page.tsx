import { JSX, useState } from 'react'
import { useData } from 'vike-react/useData'
import { useSchool } from '../../lib/school-context'
import type { Data } from '../+data'
import type { PublicSchool, SitePage } from '../../lib/types'
import PublicSiteLayout from '../../components/public-site/PublicSiteLayout'
import { getTemplateHome } from '../../components/public-site/templates'

const FALLBACK_NAV_PAGES = [
  { _id: 'about', title: 'About Us', slug: 'about', isHomePage: false },
  { _id: 'admissions', title: 'Admissions', slug: 'admissions', isHomePage: false },
  { _id: 'faq', title: 'FAQ', slug: 'faq', isHomePage: false },
  { _id: 'contact', title: 'Contact', slug: 'contact', isHomePage: false },
] as unknown as SitePage[]

const features = [
  {
    category: 'People Management',
    icon: 'users',
    items: [
      { title: 'Student Management', desc: 'Enroll students individually or bulk import via CSV. Track admissions, classes, and academic history.' },
      { title: 'Teacher Management', desc: 'Manage teacher profiles, qualifications, and assign them to classes and subjects.' },
      { title: 'Parent Portal', desc: 'Parents view their children\'s grades, attendance, fees, and report cards in one place.' },
    ],
  },
  {
    category: 'Academics',
    icon: 'book',
    items: [
      { title: 'Class & Subject Setup', desc: 'Create classes with sections, assign subjects and class teachers. Manage capacity and levels.' },
      { title: 'Session & Term Management', desc: 'Set up academic sessions with multiple terms, start/end dates, and current term tracking.' },
      { title: 'Attendance Tracking', desc: 'Mark daily attendance per class. Students and parents see summaries with present, absent, and late counts.' },
    ],
  },
  {
    category: 'Exams & Results',
    icon: 'clipboard',
    items: [
      { title: 'Computer-Based Testing', desc: 'Create timed CBT exams with MCQ, true/false, short answer, and essay questions. Auto-graded instantly.' },
      { title: 'Score Management', desc: 'Enter scores with breakdowns — tests, assignments, projects, quizzes, practicals, and exams.' },
      { title: 'Report Cards', desc: 'Auto-generate report cards with scores, averages, positions, grades, and teacher/principal remarks. Download as PDF.' },
    ],
  },
  {
    category: 'Finance',
    icon: 'dollar',
    items: [
      { title: 'Fee Management', desc: 'Set up fees per class and term with detailed breakdowns. Track paid, partial, and outstanding balances.' },
      { title: 'Online Payments', desc: 'Parents pay school fees online per term or in full. Payment tracking with receipts and history.' },
      { title: 'Financial Reports', desc: 'View total collections, outstanding fees, and payment summaries across classes and sessions.' },
    ],
  },
  {
    category: 'Communication',
    icon: 'bell',
    items: [
      { title: 'Notice Board', desc: 'Post announcements for staff, parents, students, or everyone. Pin important notices and set expiry dates.' },
      { title: 'Role-Based Dashboards', desc: 'Each role sees what matters — admins get school-wide stats, teachers see their classes, parents see their children.' },
      { title: 'Audit Logs', desc: 'Track every action in the system — who did what, when. Full accountability and transparency.' },
    ],
  },
]

const stats = [
  { value: '4', label: 'User Roles' },
  { value: '20+', label: 'Modules' },
  { value: '100%', label: 'Cloud-Based' },
  { value: '24/7', label: 'Access' },
]

const roles = [
  {
    name: 'Admin',
    desc: 'Full control over school setup, users, academics, finance, and settings.',
    color: 'blue',
    features: ['Manage all users', 'Set up classes & subjects', 'Configure fees', 'View audit logs', 'School settings'],
  },
  {
    name: 'Teacher',
    desc: 'Manage classes, enter scores, create exams, and track attendance.',
    color: 'green',
    features: ['Enter exam scores', 'Create CBT exams', 'Mark attendance', 'View class lists', 'Grade submissions'],
  },
  {
    name: 'Parent',
    desc: 'Monitor children\'s academic progress, fees, and attendance.',
    color: 'purple',
    features: ['View children\'s grades', 'Track attendance', 'Pay school fees', 'Download report cards', 'Read notices'],
  },
  {
    name: 'Student',
    desc: 'Take exams, view results, check attendance, and stay informed.',
    color: 'orange',
    features: ['Take CBT exams', 'View results', 'Check attendance', 'See fee status', 'Read notices'],
  },
]

const howItWorks = [
  { step: '1', title: 'Create Your School', desc: 'Sign up and set up your school profile, logo, and basic information in minutes.' },
  { step: '2', title: 'Set Up Academics', desc: 'Create sessions, classes, subjects, and assign teachers. Import students via CSV or add them one by one.' },
  { step: '3', title: 'Go Live', desc: 'Teachers enter scores, mark attendance, and create exams. Parents and students log in to their portals.' },
  { step: '4', title: 'Track Everything', desc: 'Monitor finances, generate report cards, send notices, and view analytics — all from your dashboard.' },
]

const faqs = [
  { q: 'Is Sqoolify free to use?', a: 'Yes, you can get started for free. We offer plans that scale with your school size.' },
  { q: 'Can parents pay fees online?', a: 'Yes. Parents can pay per term or the full balance directly from their portal.' },
  { q: 'Does it work on mobile?', a: 'Absolutely. Sqoolify is fully responsive and works on phones, tablets, and desktops.' },
  { q: 'Can I import existing student data?', a: 'Yes. You can bulk import students, teachers, and parents using CSV files.' },
  { q: 'Is the CBT exam system timed?', a: 'Yes. Exams have configurable time limits, auto-save answers, and auto-submit when time expires.' },
  { q: 'How are report cards generated?', a: 'Report cards are auto-generated from exam scores with grades, averages, positions, and remarks. Download as PDF.' },
]

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-200', light: 'bg-orange-50' },
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { school } = useSchool()
  const { homePage, navPages } = useData<Data>() || {}
  const brandName = school?.name || 'Sqoolify'

  // Subdomain → render school home page with DB content
  if (school) {
    const effectiveNavPages = navPages?.length ? navPages : FALLBACK_NAV_PAGES
    const SchoolHomePage = getTemplateHome(school as PublicSchool)
    return (
      <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
        <SchoolHomePage school={school as PublicSchool} sitePage={homePage || undefined} />
      </PublicSiteLayout>
    )
  }

  // Root domain → marketing page
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-blue-600">{brandName}</a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#roles" className="text-sm text-gray-600 hover:text-gray-900 transition">Who It's For</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">How It Works</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Get Started Free
            </a>
          </div>
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
            <a href="#roles" className="block text-gray-600 hover:text-gray-900">Who It's For</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#faq" className="block text-gray-600 hover:text-gray-900">FAQ</a>
            <div className="pt-3 border-t flex gap-3">

              <a href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Get Started Free
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 lg:py-32 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-400/20 rounded-full" />
          <div className="absolute top-1/3 -right-12 w-80 h-80 bg-blue-400/15 rounded-full" />
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-blue-300/15 rounded-full" />
          <div className="absolute top-20 right-1/3 w-32 h-32 bg-blue-300/10 rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            The complete school management platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Run Your Entire School<br />
            From <span className="text-blue-200">One Platform</span>
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Manage students, teachers, exams, fees, attendance, report cards, and more.
            Built for Nigerian schools that want to go digital without the headache.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-blue-50 transition shadow-lg"
            >
              Start Free Today
            </a>
            <a
              href="#features"
              className="border border-white/30 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-white/10 transition"
            >
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-20 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 -right-20 w-72 h-72 bg-blue-50 rounded-full" />
          <div className="absolute bottom-20 -left-16 w-56 h-56 bg-blue-50 rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-4">Features</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything Your School Needs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From enrollment to graduation — {brandName} handles academics, finance, communication, and administration.
            </p>
          </div>

          <div className="space-y-16">
            {features.map((group, gi) => (
              <div key={group.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                    <CategoryIcon name={group.icon} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{group.category}</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {group.items.map((feature) => (
                    <div
                      key={feature.title}
                      className="bg-white rounded-xl p-6 hover:shadow-lg border border-gray-100 hover:border-blue-100 transition-all group"
                    >
                      <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">{feature.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50/50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-1/4 w-48 h-48 bg-blue-100/40 rounded-full" />
          <div className="absolute bottom-0 -left-10 w-40 h-40 bg-purple-100/30 rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-4">Who It's For</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Built for Everyone in the School</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Four dedicated portals — each role sees exactly what they need, nothing more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => {
              const c = colorMap[role.color]
              return (
                <div key={role.name} className={`bg-white rounded-xl p-6 border ${c.border} hover:shadow-lg hover:-translate-y-1 transition-all`}>
                  <div className={`w-12 h-12 ${c.light} rounded-xl flex items-center justify-center mb-4`}>
                    <span className={`text-lg font-bold ${c.text}`}>{role.name[0]}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{role.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{role.desc}</p>
                  <ul className="space-y-2">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className={`w-4 h-4 ${c.text} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative px-6 py-20 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 -right-16 w-56 h-56 bg-blue-50 rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-4">How It Works</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get Started in 4 Steps</h2>
            <p className="text-gray-600 text-lg">From signup to full operation in under an hour.</p>
          </div>
          <div className="space-y-6">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start bg-gray-50 rounded-xl p-6 hover:bg-blue-50/50 transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-blue-600/20">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights bar */}
      <section className="relative px-6 py-14 bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full" />
          <div className="absolute -bottom-8 right-1/3 w-40 h-40 bg-blue-400/15 rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { icon: '🔒', label: 'Secure & Private' },
            { icon: '📱', label: 'Mobile Friendly' },
            { icon: '☁️', label: 'Cloud-Based' },
            { icon: '🇳🇬', label: 'Built for Nigeria' },
          ].map((item) => (
            <div key={item.label} className="text-white">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-blue-100">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-6 py-20 bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-100/30 rounded-full" />
          <div className="absolute bottom-10 -right-10 w-40 h-40 bg-blue-100/20 rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-4">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 text-sm">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full" />
          <div className="absolute bottom-0 -left-8 w-56 h-56 bg-blue-400/15 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300/15 rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Digitize Your School?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
            Join schools already using {brandName} to manage students, grades, fees, and more — all from one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-blue-50 transition shadow-lg"
            >
              Get Started for Free
            </a>
            <a
              href="/login"
              className="border border-white/30 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-white/10 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <a href="/" className="text-xl font-bold text-white">{brandName}</a>
              <p className="mt-3 text-sm text-gray-500 max-w-sm">
                The complete school management platform. Manage students, teachers, exams, fees, attendance, and report cards — all in one place.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#roles" className="hover:text-white transition">Who It's For</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/login" className="hover:text-white transition">Sign In</a></li>
                <li><a href="/register" className="hover:text-white transition">Create Account</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CategoryIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    book: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    clipboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    dollar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bell: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  }
  return icons[name] || null
}
