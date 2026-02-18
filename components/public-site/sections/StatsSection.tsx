import type { StatsSectionContent } from '../../../lib/types';

export default function StatsSection({ content }: { content: StatsSectionContent }) {
  const bgColor = content.backgroundColor || '#3B82F6';
  const stats = content.stats || [];

  if (stats.length === 0) return null;

  return (
    <section className="relative px-6 py-24 text-white overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.07] bg-white" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">{content.subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${
          stats.length <= 2
            ? 'grid-cols-2 max-w-2xl mx-auto'
            : stats.length === 3
            ? 'grid-cols-3 max-w-4xl mx-auto'
            : 'grid-cols-2 lg:grid-cols-4'
        }`}>
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              {stat.icon && (
                <div className="text-3xl mb-3">{stat.icon}</div>
              )}
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-2">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
