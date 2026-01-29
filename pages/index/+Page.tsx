export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-blue-600">Sqoolify</a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900">Sign In</a>
            <a
              href="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Reclaim Your <span className="text-blue-600">Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered school management and exam grading platform. Create exams, grade
            automatically, generate report cards, and manage your entire school — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
            >
              Get Started for Free
            </a>
            <a
              href="#how-it-works"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">All-in-One School Platform</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to manage students, teachers, exams, and results.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Automatic Grading',
                desc: 'Grade hundreds of exams across MCQ, theory, and cloze questions in minutes.',
              },
              {
                title: 'Question Generator',
                desc: 'Turn lesson notes into ready-made exam questions using AI.',
              },
              {
                title: 'Malpractice Control',
                desc: "Students can't copy, paste, or switch tabs during exams.",
              },
              {
                title: 'Report Cards',
                desc: 'Generate PDF report cards with scores, averages, positions, and remarks.',
              },
              {
                title: 'Instant Feedback',
                desc: 'Personalized automatic feedback for every student answer.',
              },
              {
                title: 'Export Results',
                desc: 'Download organized results instantly in CSV, Excel, or PDF.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Sqoolify Works</h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Create an Exam', desc: 'Set questions or generate them from lesson notes using AI.' },
              { step: '2', title: 'Create Student Group', desc: 'Organize students by class or subject. They join with a unique link.' },
              { step: '3', title: 'Publish Exam', desc: 'Assign to your student group. Timed, autosaving, and secure.' },
              { step: '4', title: 'Review Results', desc: 'Get instant scores, review answers, approve grades, and edit if needed.' },
              { step: '5', title: 'Export & Share', desc: 'Export results for your records. Students get instant feedback.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Grade Faster and Smarter?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Join educators using Sqoolify to save hours, give better feedback, and focus on what
          really matters — teaching.
        </p>
        <a
          href="/login"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition"
        >
          Get Started for Free
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 Sqoolify. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
