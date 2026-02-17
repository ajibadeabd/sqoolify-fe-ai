import type { FeaturesSectionContent, PublicSchool } from '../../../lib/types';

export default function FeaturesSection({
  content,
  school,
}: {
  content: FeaturesSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';
  const cols = content.columns || 3;
  const gridCols =
    cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="px-6 py-24 bg-gray-50">
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
        <div className={`grid gap-6 lg:gap-8 ${gridCols}`}>
          {(content.features || []).map((feature, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: primaryColor }}
              />
              {feature.icon && (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  {feature.icon}
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
