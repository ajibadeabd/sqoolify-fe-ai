import React, { createContext, useContext } from 'react';
import type { CanvasBlock, CanvasBlockType } from '../../../../lib/types';
import { Icon } from '../shared/icons';

// ─── Edit Mode Context ───────────────────────────────────────────────────────

export interface EditModeContextType {
  isEditMode: true;
  selectedId: string | null;
  blocks: CanvasBlock[];
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  // Canvas DnD
  activeDrag: { kind: 'block'; id: string } | { kind: 'palette'; type: CanvasBlockType } | null;
  dropTarget: { id: string; pos: 'before' | 'after' } | null;
  onDragStartBlock: (id: string) => void;
  onDragEnd: () => void;
  onDragOverBlock: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDropOnBlock: (id: string) => void;
  onClearDropTarget: (id: string) => void;
}

export const EditModeContext = createContext<EditModeContextType | null>(null);

// ─── Editable Block Wrapper ──────────────────────────────────────────────────

export function EditableBlockWrapper({ block, children }: { block: CanvasBlock; children: React.ReactNode }) {
  const ctx = useContext(EditModeContext);
  if (!ctx) return <>{children}</>;

  const idx = ctx.blocks.findIndex(b => b.id === block.id);
  const isFirst = idx === 0;
  const isLast = idx === ctx.blocks.length - 1;
  const isSelected = ctx.selectedId === block.id;
  const isDragging = ctx.activeDrag?.kind === 'block' && ctx.activeDrag.id === block.id;
  const dropBefore = ctx.dropTarget?.id === block.id && ctx.dropTarget.pos === 'before';
  const dropAfter = ctx.dropTarget?.id === block.id && ctx.dropTarget.pos === 'after';

  return (
    <div
      className={`relative group cursor-pointer outline-0 transition-opacity ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : 'hover:ring-2 hover:ring-blue-300 hover:ring-inset'} ${isDragging ? 'opacity-25' : ''}`}
      draggable
      onDragStart={e => {
        if ((e.target as Element).closest('[data-no-drag]')) { e.preventDefault(); return; }
        const ghost = document.createElement('div');
        ghost.style.cssText = 'position:fixed;top:-9999px;background:white;border:1.5px solid #e5e7eb;border-radius:10px;padding:6px 14px 6px 10px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);color:#111827;white-space:nowrap;';
        ghost.innerHTML = `<span style="font-size:16px">${BLOCK_EMOJIS[block.type]}</span><span style="text-transform:capitalize">${block.type}</span>`;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 60, 18);
        setTimeout(() => ghost.remove(), 0);
        e.stopPropagation();
        ctx.onDragStartBlock(block.id);
      }}
      onDragEnd={() => ctx.onDragEnd()}
      onDragOver={e => { ctx.onDragOverBlock(block.id, e); }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) ctx.onClearDropTarget(block.id);
      }}
      onDrop={e => {
        e.stopPropagation();
        ctx.onDropOnBlock(block.id);
      }}
      onClick={() => ctx.onSelect(block.id)}
    >
      {/* Drop indicator — before */}
      {dropBefore && (
        <div className="absolute top-0 left-0 right-0 h-0.75 bg-blue-500 z-60 pointer-events-none -translate-y-px">
          <div className="absolute -top-1.25 left-3 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
        </div>
      )}

      {children}

      {/* Drop indicator — after */}
      {dropAfter && (
        <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-500 z-60 pointer-events-none translate-y-px">
          <div className="absolute -top-1.25 left-3 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
        </div>
      )}

      {/* Hover / select toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-50 transition-opacity pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ backgroundColor: isSelected ? 'rgba(59,130,246,0.9)' : 'rgba(0,0,0,0.72)' }}
      >
        {/* Left: drag handle + type label */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center cursor-grab text-white/60 hover:text-white pointer-events-auto transition" title="Drag to reorder">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zM16 6a2 2 0 110-4 2 2 0 010 4zM16 14a2 2 0 110-4 2 2 0 010 4zM16 22a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{block.type}</span>
        </div>
        {/* Right: action buttons */}
        <div className="flex items-center gap-1 pointer-events-auto" data-no-drag>
          <button
            onClick={e => { e.stopPropagation(); ctx.onMoveUp(block.id); }}
            disabled={isFirst}
            className="w-6 h-6 flex items-center justify-center rounded bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30 transition"
            title="Move up"
          >↑</button>
          <button
            onClick={e => { e.stopPropagation(); ctx.onMoveDown(block.id); }}
            disabled={isLast}
            className="w-6 h-6 flex items-center justify-center rounded bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30 transition"
            title="Move down"
          >↓</button>
          <button
            onClick={e => { e.stopPropagation(); ctx.onSelect(block.id); }}
            className="px-3 h-6 flex items-center rounded bg-white/20 hover:bg-white/40 text-white text-xs font-bold transition"
          >Edit</button>
          <button
            onClick={e => { e.stopPropagation(); ctx.onDelete(block.id); }}
            className="w-6 h-6 flex items-center justify-center rounded bg-white/20 hover:bg-red-500 text-white text-xs transition"
            title="Delete block"
          >×</button>
        </div>
      </div>
    </div>
  );
}

// ─── Block Color Map (for editor UI) ─────────────────────────────────────────

export const BLOCK_COLORS: Record<CanvasBlockType, string> = {
  hero: '#8B5CF6',
  text: '#3B82F6',
  features: '#10B981',
  stats: '#F59E0B',
  gallery: '#EC4899',
  cta: '#EF4444',
  testimonials: '#6B7280',
};

export const BLOCK_EMOJIS: Record<CanvasBlockType, string> = {
  hero: '🖼',
  text: '📝',
  features: '✨',
  stats: '📊',
  gallery: '🎨',
  cta: '🚀',
  testimonials: '💬',
};

// ─── Block Defaults ───────────────────────────────────────────────────────────

export const BLOCK_DEFAULTS: Record<CanvasBlockType, Record<string, any>> = {
  hero: {
    layout: 'split',
    headline: 'Your Headline Here',
    subheadline: 'Sub-headline',
    description: 'Add a brief description of your school here.',
    buttonText: 'Learn More',
    buttonLink: '/admissions',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
  },
  text: {
    badge: '',
    heading: 'Section Heading',
    content: 'Add your content here. Tell your story.',
    alignment: 'left',
  },
  features: {
    badge: 'Features',
    heading: 'What We Offer',
    items: [
      { iconName: 'curriculum', title: 'Feature One', desc: 'Describe this feature in detail.' },
      { iconName: 'community', title: 'Feature Two', desc: 'Describe this feature in detail.' },
      { iconName: 'achievement', title: 'Feature Three', desc: 'Describe this feature in detail.' },
    ],
  },
  stats: {
    items: [
      { value: '500+', label: 'Students' },
      { value: '95%', label: 'Pass Rate' },
      { value: '20+', label: 'Subjects' },
      { value: '10 yrs', label: 'Experience' },
    ],
  },
  gallery: { images: [], columns: '3' },
  cta: {
    badge: 'Admissions Open',
    headline: 'Ready to join us?',
    description: 'Applications are now open for the new academic year.',
    buttonText: 'Apply Now',
    buttonLink: '/admissions',
  },
  testimonials: {
    quote: 'This school has been the best decision we made for our child. The teachers are exceptional and the environment is nurturing.',
    author: 'Parent Name',
    role: 'Parent of Student',
  },
};

// ─── Block Renderer ───────────────────────────────────────────────────────────

type BlockProps = { data: Record<string, any>; pc: string };

function HeroBlock({ data, pc }: BlockProps) {
  const {
    layout = 'split', headline = '', subheadline = '', description = '',
    buttonText = '', buttonLink = '/admissions', image = '',
  } = data;

  if (layout === 'fullbleed') {
    return (
      <section className="relative min-h-[85vh] flex items-end overflow-hidden bg-gray-900">
        {image && <img src={image} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="relative w-full max-w-6xl mx-auto px-8 pb-20 pt-40">
          <h1 className="text-[3.5rem] lg:text-[5rem] font-black text-white leading-[0.92] tracking-tighter mb-4">
            {headline}<span className="block" style={{ color: pc }}>{subheadline}</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mb-8 leading-relaxed">{description}</p>
          {buttonText && (
            <a href={buttonLink} className="inline-flex items-center gap-3 px-8 py-4 font-bold text-white rounded-xl hover:opacity-90 transition" style={{ backgroundColor: pc }}>
              {buttonText} →
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col lg:flex-row min-h-[80vh] overflow-hidden">
      <div className="w-full lg:w-[52%] flex flex-col justify-center relative bg-white px-8 lg:px-16 py-20 lg:py-0">
        <div className="absolute left-0 top-16 bottom-16 w-1" style={{ backgroundColor: pc }} />
        <div className="lg:pl-8">
          <h1 className="text-[2.8rem] lg:text-[4.5rem] font-black leading-[0.92] tracking-tighter text-gray-950 mb-6">
            {headline}
            <span className="block" style={{ color: pc }}>{subheadline}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-8">{description}</p>
          {buttonText && (
            <a href={buttonLink} className="inline-flex items-center gap-3 px-8 py-4 font-bold text-white rounded-xl hover:opacity-90 transition w-fit" style={{ backgroundColor: pc }}>
              {buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </a>
          )}
        </div>
      </div>
      <div className="w-full lg:w-[48%] relative min-h-[50vw] lg:min-h-0 bg-gray-100">
        {image && <img src={image} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: pc }} />
      </div>
    </section>
  );
}

function TextBlock({ data, pc }: BlockProps) {
  const { badge = '', heading = '', content = '', alignment = 'left' } = data;
  return (
    <section className="py-20 px-8 bg-white">
      <div className={`max-w-4xl mx-auto ${alignment === 'center' ? 'text-center' : ''}`}>
        {badge && <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: pc }}>{badge}</span>}
        <h2 className="text-3xl lg:text-5xl font-black text-gray-950 tracking-tighter mb-6">{heading}</h2>
        {content && <p className="text-gray-500 text-lg leading-relaxed">{content}</p>}
      </div>
    </section>
  );
}

function FeaturesBlock({ data, pc }: BlockProps) {
  const { badge = '', heading = '', items = [] } = data;
  return (
    <section className="py-24 px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {badge && <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: pc }}>{badge}</span>}
        <h2 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter mb-12">{heading}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border border-gray-200">
          {items.map((item: any, i: number) => (
            <div key={i} className={`p-8 lg:p-10 bg-white hover:bg-gray-50 transition ${i % 3 < 2 ? 'border-r border-gray-200' : ''} ${Math.floor(i / 3) < Math.floor((items.length - 1) / 3) ? 'border-b border-gray-200' : ''}`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-5" style={{ backgroundColor: pc }}>
                <Icon name={item.iconName || 'curriculum'} className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 tracking-tight">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ data, pc }: BlockProps) {
  const { items = [] } = data;
  return (
    <section className="py-14 px-8 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(items.length, 4)} divide-x divide-gray-100`}>
          {items.map((item: any, i: number) => (
            <div key={i} className="text-center px-8 py-6">
              <div className="text-4xl lg:text-5xl font-black tracking-tighter mb-1" style={{ color: pc }}>{item.value}</div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ data }: BlockProps) {
  const { images = [], columns = '3' } = data;
  const colMap: Record<string, string> = { '2': 'grid-cols-2', '3': 'grid-cols-2 lg:grid-cols-3', '4': 'grid-cols-2 lg:grid-cols-4' };
  const colClass = colMap[String(columns)] || 'grid-cols-3';
  if (!images.length) {
    return (
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 font-medium">Add images to display gallery</p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-12 px-8 bg-white">
      <div className={`max-w-6xl mx-auto grid ${colClass} gap-3`}>
        {images.map((url: string, i: number) => (
          <div key={i} className="aspect-video overflow-hidden bg-gray-100">
            <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({ data, pc }: BlockProps) {
  const { badge = '', headline = '', description = '', buttonText = '', buttonLink = '/admissions' } = data;
  return (
    <section className="py-24 px-8 relative overflow-hidden" style={{ backgroundColor: pc }}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="relative max-w-3xl mx-auto text-center">
        {badge && (
          <span className="inline-block px-5 py-2 mb-6 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white">{badge}</span>
        )}
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 whitespace-pre-line">{headline}</h2>
        <p className="text-white/60 text-lg mb-10 leading-relaxed">{description}</p>
        {buttonText && (
          <a href={buttonLink} className="inline-flex items-center gap-3 bg-white px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all" style={{ color: pc }}>
            {buttonText} →
          </a>
        )}
      </div>
    </section>
  );
}

function TestimonialBlock({ data, pc }: BlockProps) {
  const { quote = '', author = '', role = '' } = data;
  return (
    <section className="py-24 px-8 bg-white relative overflow-hidden">
      <div className="absolute -top-8 left-8 text-[14rem] font-black leading-none select-none pointer-events-none opacity-[0.04]" style={{ color: pc }}>"</div>
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 italic leading-relaxed mb-10">"{quote}"</p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-px bg-gray-300" />
          <div>
            <div className="font-black text-gray-900">{author}</div>
            <div className="text-sm text-gray-500 mt-0.5">{role}</div>
          </div>
          <div className="w-10 h-px bg-gray-300" />
        </div>
      </div>
    </section>
  );
}

// ─── renderBlock dispatcher ───────────────────────────────────────────────────

export function renderBlock(block: CanvasBlock, pc: string): React.ReactNode {
  const props = { data: block.data, pc };
  switch (block.type) {
    case 'hero':        return <HeroBlock {...props} />;
    case 'text':        return <TextBlock {...props} />;
    case 'features':    return <FeaturesBlock {...props} />;
    case 'stats':       return <StatsBlock {...props} />;
    case 'gallery':     return <GalleryBlock {...props} />;
    case 'cta':         return <CtaBlock {...props} />;
    case 'testimonials': return <TestimonialBlock {...props} />;
    default:            return null;
  }
}
