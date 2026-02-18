import type { TeamSectionContent, PublicSchool } from '../../../lib/types';

export default function TeamSection({
  content,
  school,
}: {
  content: TeamSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';
  const members = content.members || [];

  if (members.length === 0) return null;

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

        <div className={`grid gap-8 ${
          members.length <= 2
            ? 'md:grid-cols-2 max-w-3xl mx-auto'
            : members.length === 3
            ? 'md:grid-cols-3 max-w-5xl mx-auto'
            : 'sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {members.map((member, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Photo */}
              <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-sm font-medium mt-1" style={{ color: primaryColor }}>
                  {member.role}
                </p>
                {member.bio && (
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">{member.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
