import type { HeroSectionContent, PublicSchool } from '../../../lib/types';

export default function HeroSection({
  content,
  school,
}: {
  content: HeroSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';
  const hasImage = !!content.backgroundImage;

  const bgStyle = hasImage
    ? {
        backgroundImage: `url(${content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={bgStyle}>
      {/* Overlay for background image */}
      {hasImage && <div className="absolute inset-0 bg-black/50" />}

      {/* Gradient background when no image */}
      {!hasImage && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 40%, #1E293B 100%)`,
        }} />
      )}

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07] bg-white" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-[0.05] bg-white" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="text-lg lg:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {content.subtitle}
          </p>
        )}
        {content.ctaText && content.ctaLink && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={content.ctaLink}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
              style={{ color: primaryColor }}
            >
              {content.ctaText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent" />
    </section>
  );
}
