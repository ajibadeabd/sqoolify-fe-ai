import { useContext } from 'react';
import type { PublicSchool, SitePage } from '../../../../lib/types';
import { Icon } from '../shared/icons';
import { images as stockImages } from '../shared/content';
import { EditModeContext } from '../canvas/blocks';

// ─── Section Renderers ────────────────────────────────────────────────────────

function HeroSection({ content, pc }: { content: any; pc: string }) {
  const badge = content.badge || '';
  const headline = content.headline || 'World-Class Education';
  const headlineSub = content.headlineSub || 'For Every Child';
  const description = content.description || '';
  const stats: any[] = content.stats || [];
  const buttons: any[] = content.buttons || [];

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <img
        src={content.image || stockImages.homeHeroGrid[0].src}
        alt="Campus"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-48 lg:pb-28">
        {badge && (
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/90 text-sm font-medium uppercase tracking-wider">{badge}</span>
          </div>
        )}

        <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem] font-black text-white leading-[0.95] tracking-tighter mb-8 max-w-5xl uppercase">
          {headline}{' '}
          <span style={{ color: pc }}>{headlineSub}</span>
        </h1>

        {description && (
          <p className="text-lg lg:text-xl text-white/50 max-w-xl leading-relaxed mb-10">{description}</p>
        )}

        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-16">
            {buttons[0] && (
              <a
                href={buttons[0].link || '#'}
                className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all duration-300"
                style={{ backgroundColor: pc, color: '#fff' }}
              >
                {buttons[0].text}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
            {buttons[1] && (
              <a
                href={buttons[1].link || '#'}
                className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                {buttons[1].text}
              </a>
            )}
          </div>
        )}

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/10">
            {stats.map((s: any, i: number) => (
              <div key={i}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ content, pc }: { content: any; pc: string }) {
  const label = content.label || '';
  const title = content.title || 'What sets us apart';
  const items: any[] = content.features || [];

  return (
    <section className="bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="mb-16">
          {label && <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{label}</p>}
          <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase max-w-3xl">
            {title}
          </h2>
        </div>

        {items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {items.map((p: any, i: number) => (
              <div key={i} className="bg-gray-950 p-10 hover:bg-gray-900 transition-colors duration-300 group">
                <div className="w-14 h-14 flex items-center justify-center mb-6 border-2 group-hover:border-transparent group-hover:bg-white/10 transition-all" style={{ borderColor: `${pc}40`, color: pc }}>
                  <Icon name={p.iconName || 'academic'} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-3">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed">{p.description || p.desc || ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TextSection({ content, pc }: { content: any; pc: string }) {
  const label = content.label || '';
  const title = content.title || '';
  const para1 = content.para1 || content.content || '';
  const para2 = content.para2 || '';
  const stats: any[] = content.stats || [];
  const link = content.link || null;

  return (
    <section className="bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-5 gap-16 items-center">
          <div className="lg:col-span-2 overflow-hidden">
            <img src={stockImages.aboutStrip} alt="" className="w-full h-[500px] object-cover" />
          </div>
          <div className="lg:col-span-3">
            {label && <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: pc }}>{label}</p>}
            {title && (
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-8">{title}</h2>
            )}
            {para1 && <p className="text-gray-400 text-lg leading-relaxed mb-5">{para1}</p>}
            {para2 && <p className="text-gray-500 leading-relaxed mb-10">{para2}</p>}

            {stats.length > 0 && (
              <div className="flex gap-10 mb-10 pt-8 border-t border-white/10">
                {stats.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-white">{s.val}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {link?.href && (
              <a href={link.href} className="group inline-flex items-center gap-3 font-bold text-lg uppercase tracking-wider" style={{ color: pc }}>
                {link.text || 'Learn More'}
                <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GallerySection({ content, pc }: { content: any; pc: string }) {
  const label = content.label || 'Campus Life';
  const title = content.title || 'A second home';
  const imgs = content.images || { main: stockImages.homeHeroGrid[0], items: [] };
  const statCard = content.statCard || null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="mb-16">
          {label && <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{label}</p>}
          <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">{title}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-2 h-[500px] lg:h-[600px]">
          <div className="col-span-2 row-span-2 overflow-hidden relative group">
            <img src={imgs.main?.src} alt={imgs.main?.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            {imgs.main?.label && (
              <div className="absolute bottom-6 left-6">
                {imgs.main?.tag && <span className="inline-block px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-2" style={{ backgroundColor: pc }}>{imgs.main.tag}</span>}
                <h3 className="text-2xl font-black text-white uppercase">{imgs.main.label}</h3>
              </div>
            )}
          </div>

          {(imgs.items || []).slice(0, 3).map((img: any, i: number) => (
            <div key={i} className="overflow-hidden relative group">
              <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {img.label && <div className="absolute bottom-4 left-4"><h4 className="text-sm font-black text-white uppercase tracking-wide">{img.label}</h4></div>}
            </div>
          ))}

          {statCard && (
            <div className="flex flex-col items-center justify-center" style={{ backgroundColor: pc }}>
              <div className="text-4xl font-black text-white">{statCard.val}</div>
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">{statCard.label}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ content, pc }: { content: any; pc: string }) {
  const stats: any[] = content.stats || content.items || [];

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
          {stats.map((s: any, i: number) => (
            <div key={i} className="bg-white px-12 py-12 text-center">
              <div className="text-5xl lg:text-6xl font-black tracking-tighter mb-3" style={{ color: pc }}>{s.val}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ content, pc }: { content: any; pc: string }) {
  const label = content.label || 'Testimonials';
  const title = content.title || 'What they say';
  const items: any[] = content.testimonials || [];
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="mb-16">
          {label && <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: pc }}>{label}</p>}
          <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] uppercase">{title}</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {featured && (
            <div className="lg:row-span-2 p-10 lg:p-12 text-white relative overflow-hidden" style={{ backgroundColor: pc }}>
              <div className="text-[120px] font-serif leading-none opacity-10 -mb-16">"</div>
              <p className="text-xl lg:text-2xl font-bold leading-relaxed mb-10">{featured.quote || featured.content || ''}</p>
              <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                <div className="w-14 h-14 bg-white/20 flex items-center justify-center font-black text-lg">
                  {featured.initials || featured.name?.split(' ').map((w: string) => w[0]).join('')}
                </div>
                <div>
                  <div className="font-black uppercase tracking-wide">{featured.name}</div>
                  <div className="text-white/60 text-sm">{featured.role || ''}</div>
                </div>
              </div>
            </div>
          )}

          {rest.map((t: any, i: number) => (
            <div key={i} className="border-2 border-gray-100 p-8 hover:border-gray-200 transition-colors">
              <div className="flex gap-0.5 mb-5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">{t.quote || t.content || ''}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: pc }}>
                  {t.initials || t.name?.split(' ').map((w: string) => w[0]).join('')}
                </div>
                <div>
                  <div className="font-black text-gray-900 text-sm uppercase tracking-wide">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role || ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ content, pc }: { content: any; pc: string }) {
  const badge = content.badge || '';
  const headline = content.headline || content.title || 'Join Our School';
  const description = content.description || '';
  const buttons: any[] = content.buttons || [];

  return (
    <section className="relative py-32 overflow-hidden">
      <img src={stockImages.aboutHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pc }} />
            <span className="text-white/80 text-sm font-bold uppercase tracking-wider">{badge}</span>
          </div>
        )}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] uppercase mb-6">{headline}</h2>
        {description && <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-12">{description}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons[0] && (
            <a
              href={buttons[0].link || '#'}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ backgroundColor: pc, color: '#fff' }}
            >
              {buttons[0].text}
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
          {buttons[1] && (
            <a
              href={buttons[1].link || '#'}
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white uppercase tracking-wider border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all"
            >
              {buttons[1].text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ content, pc }: { content: any; pc: string }) {
  const info = content.contactInfo || content;
  return (
    <section className="bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid sm:grid-cols-3 gap-px bg-white/10">
          {info.address && (
            <div className="bg-gray-950 p-10">
              <div className="w-12 h-12 flex items-center justify-center border-2 mb-6" style={{ borderColor: `${pc}40`, color: pc }}>
                <Icon name="mapPin" className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: pc }}>Address</p>
              <p className="text-gray-300 leading-relaxed">{info.address}</p>
            </div>
          )}
          {info.phone && (
            <div className="bg-gray-950 p-10">
              <div className="w-12 h-12 flex items-center justify-center border-2 mb-6" style={{ borderColor: `${pc}40`, color: pc }}>
                <Icon name="phone" className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: pc }}>Phone</p>
              <p className="text-gray-300">{info.phone}</p>
            </div>
          )}
          {info.email && (
            <div className="bg-gray-950 p-10">
              <div className="w-12 h-12 flex items-center justify-center border-2 mb-6" style={{ borderColor: `${pc}40`, color: pc }}>
                <Icon name="mail" className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: pc }}>Email</p>
              <p className="text-gray-300">{info.email}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function renderSection(type: string, content: any, pc: string) {
  switch (type) {
    case 'hero':         return <HeroSection content={content} pc={pc} />;
    case 'features':     return <FeaturesSection content={content} pc={pc} />;
    case 'text':         return <TextSection content={content} pc={pc} />;
    case 'gallery':      return <GallerySection content={content} pc={pc} />;
    case 'stats':        return <StatsSection content={content} pc={pc} />;
    case 'testimonials': return <TestimonialsSection content={content} pc={pc} />;
    case 'cta':          return <CTASection content={content} pc={pc} />;
    case 'contact':      return <ContactSection content={content} pc={pc} />;
    default:             return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BoldCanvasPage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#3B82F6';
  const editCtx = useContext(EditModeContext);

  const sections = editCtx?.isEditMode
    ? editCtx.blocks.map(b => ({ type: b.type, content: b.data, isVisible: true }))
    : (sitePage?.sections || []).filter(s => s.isVisible !== false);

  if (!sections.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: pc }}>Bold Canvas</p>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">Your page is empty</h2>
        <p className="text-gray-500">Add sections in the editor to start building.</p>
      </div>
    );
  }

  return (
    <>
      {sections.map((section, i) => (
        <div key={i}>
          {renderSection(section.type, section.content, pc)}
        </div>
      ))}
    </>
  );
}
