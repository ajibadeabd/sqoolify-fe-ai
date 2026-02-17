import { useState, useEffect, type ReactNode, JSX } from 'react';
import type { PublicSchool, SitePage } from '../../lib/types';

const socialIcons: Record<string, JSX.Element> = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

export default function PublicSiteLayout({
  children,
  school,
  navPages = [],
}: {
  children: ReactNode;
  school: PublicSchool;
  navPages?: SitePage[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-md border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 group">
              {school.logo && (
                <img src={school.logo} alt={school.name} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
              )}
              <div>
                <span className="text-xl font-bold tracking-tight" style={{ color: primaryColor }}>
                  {school.name}
                </span>
                {school.motto && (
                  <p className="text-[10px] text-gray-400 leading-tight">{school.motto}</p>
                )}
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              <a href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">
                Home
              </a>
              {navPages
                .filter((p) => !p.isHomePage)
                .map((page) => (
                  <a
                    key={page._id}
                    href={`/${page.slug}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {page.title}
                  </a>
                ))}
              <a
                href="/login"
                className="ml-3 px-6 py-2.5 text-white rounded-full text-sm font-medium hover:opacity-90 hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
              >
                Login
              </a>
            </nav>

            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-5 pt-3 space-y-1 border-t border-gray-100">
              <a href="/" className="block px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium">
                Home
              </a>
              {navPages
                .filter((p) => !p.isHomePage)
                .map((page) => (
                  <a
                    key={page._id}
                    href={`/${page.slug}`}
                    className="block px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition font-medium"
                  >
                    {page.title}
                  </a>
                ))}
              <a
                href="/login"
                className="block mx-4 mt-3 px-5 py-2.5 text-white rounded-full text-sm font-medium text-center"
                style={{ backgroundColor: primaryColor }}
              >
                Login
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          {/* Main footer content */}
          <div className="grid md:grid-cols-3 gap-10 py-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {school.logo && (
                  <img src={school.logo} alt={school.name} className="h-10 w-10 rounded-xl object-cover" />
                )}
                <span className="text-xl font-bold text-white">{school.name}</span>
              </div>
              {school.description && (
                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">{school.description}</p>
              )}

              {school.siteConfig?.socialLinks && (
                <div className="flex gap-3 mt-6">
                  {Object.entries(school.siteConfig.socialLinks).map(
                    ([platform, url]) =>
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                        >
                          {socialIcons[platform] || (
                            <span className="text-xs font-medium uppercase">{platform[0]}</span>
                          )}
                        </a>
                      ),
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-3">
                <a href="/" className="block text-sm text-gray-500 hover:text-white transition">Home</a>
                {navPages
                  .filter((p) => !p.isHomePage)
                  .map((page) => (
                    <a key={page._id} href={`/${page.slug}`} className="block text-sm text-gray-500 hover:text-white transition">
                      {page.title}
                    </a>
                  ))}
              </div>
            </div>

            {(school.address || school.phone || school.email) && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
                <div className="space-y-3 text-sm">
                  {school.address && (
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-gray-500">{school.address}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${school.phone}`} className="text-gray-500 hover:text-white transition">{school.phone}</a>
                    </div>
                  )}
                  {school.email && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${school.email}`} className="text-gray-500 hover:text-white transition">{school.email}</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800/50 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              {school.siteConfig?.footerText ||
                `\u00A9 ${new Date().getFullYear()} ${school.name}. All rights reserved.`}
            </p>
            <p className="text-xs text-gray-700">
              Powered by{' '}
              <a href="https://sqoolify.com" className="text-gray-500 hover:text-gray-300 transition font-medium">
                Sqoolify
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
