import type { ContactSectionContent, PublicSchool } from '../../../lib/types';

export default function ContactSection({
  content,
  school,
}: {
  content: ContactSectionContent;
  school: PublicSchool;
}) {
  const primaryColor = school.siteConfig?.primaryColor || '#3B82F6';
  const info = content.contactInfo || {};
  const address = info.address || school.address;
  const phone = info.phone || school.phone;
  const email = info.email || school.email;

  const items = [
    {
      label: 'Visit Us',
      value: address,
      href: address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Call Us',
      value: phone,
      href: phone ? `tel:${phone}` : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      label: 'Email Us',
      value: email,
      href: email ? `mailto:${email}` : undefined,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ].filter((item) => item.value);

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            {content.title || 'Get in Touch'}
          </h2>
        </div>
        <div className={`grid gap-6 ${items.length === 1 ? 'max-w-sm mx-auto' : items.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
          {items.map((item, i) => {
            const Card = (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.label}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">{item.value}</p>
              </div>
            );

            if (item.href) {
              return (
                <a key={i} href={item.href} target={item.label === 'Visit Us' ? '_blank' : undefined} rel="noopener noreferrer" className="no-underline">
                  {Card}
                </a>
              );
            }
            return Card;
          })}
        </div>
      </div>
    </section>
  );
}
