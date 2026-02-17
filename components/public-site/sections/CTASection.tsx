import type { CTASectionContent } from '../../../lib/types';

export default function CTASection({ content }: { content: CTASectionContent }) {
  const bgColor = content.backgroundColor || '#3B82F6';

  return (
    <section className="relative px-6 py-24 text-white overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-[0.07] bg-white" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-white/80 mb-10 text-lg max-w-xl mx-auto leading-relaxed font-light">
            {content.description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {content.primaryButtonText && content.primaryButtonLink && (
            <a
              href={content.primaryButtonLink}
              className="inline-flex items-center gap-2 bg-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ color: bgColor }}
            >
              {content.primaryButtonText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
          {content.secondaryButtonText && content.secondaryButtonLink && (
            <a
              href={content.secondaryButtonLink}
              className="border-2 border-white/30 text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              {content.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
