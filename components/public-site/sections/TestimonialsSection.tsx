import type { TestimonialsSectionContent, PublicSchool } from '../../../lib/types';

export default function TestimonialsSection({
  content,
  school,
}: {
  content: TestimonialsSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';
  const testimonials = content.testimonials || [];

  if (testimonials.length === 0) return null;

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-16">
            <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">{content.subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${
          testimonials.length === 1
            ? 'max-w-2xl mx-auto'
            : testimonials.length === 2
            ? 'md:grid-cols-2 max-w-4xl mx-auto'
            : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100"
            >
              {/* Quote mark */}
              <div
                className="absolute top-6 right-8 text-6xl font-serif leading-none opacity-10 select-none"
                style={{ color: primaryColor }}
              >
                "
              </div>

              <p className="text-gray-600 text-[15px] leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  {t.role && (
                    <p className="text-xs text-gray-400">{t.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
