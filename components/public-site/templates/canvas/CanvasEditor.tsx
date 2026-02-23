import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import type { School, SitePage, PublicSchool, CanvasBlock, CanvasBlockType } from '../../../../lib/types';
import { sitePageService } from '../../../../lib/api-services';
import {
  EditModeContext, EditModeContextType,
  renderBlock, BLOCK_COLORS, BLOCK_EMOJIS, BLOCK_DEFAULTS,
} from './blocks';
import { DEFAULT_CANVAS_BLOCKS } from './defaultBlocks';
import CanvasHomePage from './HomePage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function blockPreview(block: CanvasBlock): string {
  const d = block.data;
  switch (block.type) {
    case 'hero':        return d.headline || 'Hero section';
    case 'text':        return d.heading || 'Text section';
    case 'features':    return d.heading || 'Features section';
    case 'stats':       return `${(d.items || []).length} stat${(d.items || []).length !== 1 ? 's' : ''}`;
    case 'gallery':     return `${(d.images || []).length} image${(d.images || []).length !== 1 ? 's' : ''}`;
    case 'cta':         return d.headline || 'CTA section';
    case 'testimonials': return d.quote ? `"${String(d.quote).slice(0, 48)}…"` : 'Testimonial';
    default:            return 'Block';
  }
}

const BLOCK_PALETTE: { type: CanvasBlockType; label: string; desc: string }[] = [
  { type: 'hero',        label: 'Hero',        desc: 'Big headline + image' },
  { type: 'text',        label: 'Text',        desc: 'Heading & paragraph' },
  { type: 'features',    label: 'Features',    desc: 'Icon card grid' },
  { type: 'stats',       label: 'Stats',       desc: 'Key numbers row' },
  { type: 'gallery',     label: 'Gallery',     desc: 'Image grid' },
  { type: 'cta',         label: 'CTA',         desc: 'Call to action' },
  { type: 'testimonials', label: 'Testimonial', desc: 'Quote block' },
];

// ─── Property Field Components ────────────────────────────────────────────────

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <input
        type="text"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <textarea
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ListField({ label, items, onChange, itemDefs, defaultItem, addLabel }: {
  label: string;
  items: any[];
  onChange: (items: any[]) => void;
  itemDefs: { key: string; label: string; type: 'text' | 'textarea' }[];
  defaultItem: Record<string, any>;
  addLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        <button
          onClick={() => onChange([...items, { ...defaultItem }])}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >+ {addLabel}</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
            {itemDefs.map(f =>
              f.type === 'textarea'
                ? <textarea key={f.key} placeholder={f.label} rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs resize-none outline-none focus:ring-1 focus:ring-blue-400" value={item[f.key] || ''} onChange={e => { const next = [...items]; next[i] = { ...next[i], [f.key]: e.target.value }; onChange(next); }} />
                : <input key={f.key} type="text" placeholder={f.label} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400" value={item[f.key] || ''} onChange={e => { const next = [...items]; next[i] = { ...next[i], [f.key]: e.target.value }; onChange(next); }} />
            )}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-[10px] font-bold text-red-400 hover:text-red-600 transition">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Block Property Editor ─────────────────────────────────────────────────────

function BlockPropertyEditor({ block, onUpdate }: { block: CanvasBlock; onUpdate: (data: Partial<Record<string, any>>) => void }) {
  const d = block.data;
  const set = (key: string, val: any) => onUpdate({ [key]: val });

  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <SelectField label="Layout" value={d.layout || 'split'} onChange={v => set('layout', v)} options={[{ value: 'split', label: 'Split Screen' }, { value: 'fullbleed', label: 'Full Bleed' }]} />
          <TextField label="Headline" value={d.headline || ''} onChange={v => set('headline', v)} placeholder="Your main headline..." />
          <TextField label="Sub-headline" value={d.subheadline || ''} onChange={v => set('subheadline', v)} placeholder="Secondary text..." />
          <TextareaField label="Description" value={d.description || ''} onChange={v => set('description', v)} />
          <TextField label="Button Text" value={d.buttonText || ''} onChange={v => set('buttonText', v)} placeholder="Apply Now" />
          <TextField label="Button Link" value={d.buttonLink || ''} onChange={v => set('buttonLink', v)} placeholder="/admissions" />
          <TextField label="Image URL" value={d.image || ''} onChange={v => set('image', v)} placeholder="https://..." />
        </div>
      );
    case 'text':
      return (
        <div className="space-y-4">
          <TextField label="Badge (optional)" value={d.badge || ''} onChange={v => set('badge', v)} placeholder="e.g. About Us" />
          <TextField label="Heading" value={d.heading || ''} onChange={v => set('heading', v)} />
          <TextareaField label="Content" value={d.content || ''} onChange={v => set('content', v)} rows={5} />
          <SelectField label="Alignment" value={d.alignment || 'left'} onChange={v => set('alignment', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }]} />
        </div>
      );
    case 'features':
      return (
        <div className="space-y-4">
          <TextField label="Badge" value={d.badge || ''} onChange={v => set('badge', v)} />
          <TextField label="Heading" value={d.heading || ''} onChange={v => set('heading', v)} />
          <ListField
            label="Feature Cards"
            items={d.items || []}
            onChange={items => set('items', items)}
            itemDefs={[
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'desc', label: 'Description', type: 'textarea' },
              { key: 'iconName', label: 'Icon Name', type: 'text' },
            ]}
            defaultItem={{ iconName: 'curriculum', title: 'New Feature', desc: 'Description' }}
            addLabel="Add Card"
          />
        </div>
      );
    case 'stats':
      return (
        <div className="space-y-4">
          <ListField
            label="Stats"
            items={d.items || []}
            onChange={items => set('items', items)}
            itemDefs={[
              { key: 'value', label: 'Value (e.g. 500+)', type: 'text' },
              { key: 'label', label: 'Label (e.g. Students)', type: 'text' },
            ]}
            defaultItem={{ value: '100+', label: 'Label' }}
            addLabel="Add Stat"
          />
        </div>
      );
    case 'gallery':
      return (
        <div className="space-y-4">
          <SelectField label="Columns" value={String(d.columns || '3')} onChange={v => set('columns', v)} options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }, { value: '4', label: '4 Columns' }]} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Images</label>
              <button onClick={() => set('images', [...(d.images || []), ''])} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">+ Add Image</button>
            </div>
            <div className="space-y-2">
              {(d.images || []).map((url: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <input type="text" className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400" placeholder="Image URL" value={url} onChange={e => { const next = [...(d.images || [])]; next[i] = e.target.value; set('images', next); }} />
                  <button onClick={() => set('images', (d.images || []).filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600 text-sm px-2 transition">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-4">
          <TextField label="Badge" value={d.badge || ''} onChange={v => set('badge', v)} placeholder="e.g. Admissions Open" />
          <TextareaField label="Headline" value={d.headline || ''} onChange={v => set('headline', v)} rows={2} />
          <TextareaField label="Description" value={d.description || ''} onChange={v => set('description', v)} />
          <TextField label="Button Text" value={d.buttonText || ''} onChange={v => set('buttonText', v)} />
          <TextField label="Button Link" value={d.buttonLink || ''} onChange={v => set('buttonLink', v)} placeholder="/admissions" />
        </div>
      );
    case 'testimonials':
      return (
        <div className="space-y-4">
          <TextareaField label="Quote" value={d.quote || ''} onChange={v => set('quote', v)} rows={5} />
          <TextField label="Author Name" value={d.author || ''} onChange={v => set('author', v)} />
          <TextField label="Role / Title" value={d.role || ''} onChange={v => set('role', v)} placeholder="e.g. Parent of Student" />
        </div>
      );
    default:
      return null;
  }
}

// ─── Main CanvasEditor Component ─────────────────────────────────────────────

export default function CanvasEditor({ school, page, onClose, onSave }: {
  school: School;
  page: SitePage;
  onClose: () => void;
  onSave: () => void;
}) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>(
    page.sections?.length
      ? page.sections.map(s => ({ id: genId(), type: s.type as CanvasBlockType, data: { ...s.content } }))
      : DEFAULT_CANVAS_BLOCKS
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(64);
  const dragRef = useRef<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ kind: 'block'; id: string } | { kind: 'palette'; type: CanvasBlockType } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'before' | 'after' } | null>(null);
  const [past, setPast] = useState<CanvasBlock[][]>([]);
  const [future, setFuture] = useState<CanvasBlock[][]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;
    setSidebarWidth(sidebar.getBoundingClientRect().width);
    const observer = new ResizeObserver(entries => setSidebarWidth(entries[0].contentRect.width));
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // ── History (undo / redo) ──
  const blocksRef = useRef<CanvasBlock[]>(blocks);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  const snapshot = useCallback(() => {
    setPast(h => [...h.slice(-49), blocksRef.current]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture(f => [blocks, ...f.slice(0, 49)]);
    setBlocks(past[past.length - 1]);
    setPast(h => h.slice(0, -1));
  }, [past, blocks]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast(h => [...h.slice(-49), blocks]);
    setBlocks(future[0]);
    setFuture(f => f.slice(1));
  }, [future, blocks]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as Element).closest('input, textarea, select')) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const selectedBlock = blocks.find(b => b.id === selectedId) || null;

  // ── Block operations ──
  const addBlock = useCallback((type: CanvasBlockType) => {
    snapshot();
    const nb: CanvasBlock = { id: genId(), type, data: { ...BLOCK_DEFAULTS[type] } };
    setBlocks(prev => [...prev, nb]);
    setSelectedId(nb.id);
    setTimeout(() => previewRef.current?.scrollTo({ top: previewRef.current.scrollHeight, behavior: 'smooth' }), 100);
  }, [snapshot]);

  const removeBlock = useCallback((id: string) => {
    snapshot();
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, [snapshot]);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    snapshot();
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }, [snapshot]);

  const updateBlockData = useCallback((id: string, patch: Partial<Record<string, any>>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data: { ...b.data, ...patch } } : b));
  }, []);

  // ── Drag-and-drop reorder ──
  const handleDrop = (targetId: string) => {
    if (!dragRef.current || dragRef.current === targetId) { setDragOver(null); return; }
    snapshot();
    setBlocks(prev => {
      const from = prev.findIndex(b => b.id === dragRef.current);
      const to = prev.findIndex(b => b.id === targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
    dragRef.current = null;
    setDragOver(null);
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      await sitePageService.update(page._id, { sections: blocks.map(b => ({ type: b.type, content: b.data, isVisible: true })) } as any);
      toast.success('Canvas saved!');
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit mode context for live preview ──
  const editCtxValue = useMemo<EditModeContextType>(() => ({
    isEditMode: true,
    selectedId,
    blocks,
    onSelect: setSelectedId,
    onMoveUp: (id) => moveBlock(id, -1),
    onMoveDown: (id) => moveBlock(id, 1),
    onDelete: removeBlock,
    // Canvas DnD
    activeDrag,
    dropTarget,
    onDragStartBlock: (id) => setActiveDrag({ kind: 'block', id }),
    onDragEnd: () => { setActiveDrag(null); setDropTarget(null); },
    onDragOverBlock: (id, e) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const pos: 'before' | 'after' = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
      setDropTarget(prev => (prev?.id === id && prev.pos === pos ? prev : { id, pos }));
    },
    onClearDropTarget: (id) => setDropTarget(prev => prev?.id === id ? null : prev),
    onDropOnBlock: (targetId) => {
      if (!activeDrag) { setDropTarget(null); return; }
      snapshot();
      if (activeDrag.kind === 'block') {
        if (activeDrag.id !== targetId && dropTarget) {
          setBlocks(prev => {
            const fromIdx = prev.findIndex(b => b.id === (activeDrag as { kind: 'block'; id: string }).id);
            const toIdx = prev.findIndex(b => b.id === targetId);
            if (fromIdx < 0 || toIdx < 0) return prev;
            const insertIdx = dropTarget.pos === 'after' ? toIdx + 1 : toIdx;
            const next = [...prev];
            const [item] = next.splice(fromIdx, 1);
            const adj = insertIdx > fromIdx ? insertIdx - 1 : insertIdx;
            next.splice(adj, 0, item);
            return next;
          });
        }
      } else if (dropTarget) {
        const type = (activeDrag as { kind: 'palette'; type: CanvasBlockType }).type;
        const nb: CanvasBlock = { id: genId(), type, data: { ...BLOCK_DEFAULTS[type] } };
        setBlocks(prev => {
          const toIdx = prev.findIndex(b => b.id === targetId);
          if (toIdx < 0) return prev;
          const insertIdx = dropTarget.pos === 'after' ? toIdx + 1 : toIdx;
          const next = [...prev];
          next.splice(insertIdx, 0, nb);
          return next;
        });
        setSelectedId(nb.id);
      }
      setActiveDrag(null);
      setDropTarget(null);
    },
  }), [blocks, selectedId, moveBlock, removeBlock, activeDrag, dropTarget, snapshot]);

  // ── Preview school object ──
  const previewSchool = useMemo<PublicSchool>(() => ({
    _id: school._id,
    name: school.name,
    slug: (school as any).slug || '',
    logo: school.schoolSetup?.logo,
    phone: school.schoolSetup?.schoolPhoneNumber,
    email: school.schoolSetup?.schoolEmailAddress,
    address: school.schoolSetup?.schoolAddress,
    siteConfig: { ...school.siteConfig },
  }), [school]);

  return (
    <div className="fixed top-0 right-0 bottom-0 bg-white z-[999] flex flex-col overflow-hidden" style={{ left: sidebarWidth }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
            title="Exit editor"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-900">
              <span className="text-white text-xs font-black">C</span>
            </div>
            <span className="font-black text-gray-900 text-sm">Canvas Editor</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 text-sm">{school.name}</span>
          </div>
          <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-full">{page.title}</span>
          <div className="ml-3 flex items-center rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Simple
            </button>
            <button
              className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white"
            >
              Canvas
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={undo}
              disabled={!past.length}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-25 transition text-gray-600"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
            <button
              onClick={redo}
              disabled={!future.length}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-25 transition text-gray-600"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </button>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs text-gray-400">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Save Canvas
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Body: 3 columns ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Block Palette ─────────────────────────────────────── */}
        <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Block</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {BLOCK_PALETTE.map(bp => (
              <div
                key={bp.type}
                draggable
                onDragStart={e => {
                  const ghost = document.createElement('div');
                  ghost.style.cssText = 'position:fixed;top:-9999px;background:white;border:1.5px solid #e5e7eb;border-radius:10px;padding:6px 14px 6px 10px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);color:#111827;white-space:nowrap;';
                  ghost.innerHTML = `<span style="font-size:16px">${BLOCK_EMOJIS[bp.type]}</span><span>${bp.label}</span>`;
                  document.body.appendChild(ghost);
                  e.dataTransfer.setDragImage(ghost, 60, 18);
                  setTimeout(() => ghost.remove(), 0);
                  setActiveDrag({ kind: 'palette', type: bp.type });
                }}
                onDragEnd={() => setActiveDrag(null)}
                onClick={() => addBlock(bp.type)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-left group cursor-grab select-none"
                title="Drag to canvas or click to add"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${BLOCK_COLORS[bp.type]}15` }}>
                  {BLOCK_EMOJIS[bp.type]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-gray-700">{bp.label}</p>
                  <p className="text-xs text-gray-400 truncate">{bp.desc}</p>
                </div>
                <div className="shrink-0 opacity-30 group-hover:opacity-70 transition ml-auto">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zM16 6a2 2 0 110-4 2 2 0 010 4zM16 14a2 2 0 110-4 2 2 0 010 4zM16 22a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          {/* Blocks order list at bottom */}
          <div className="border-t border-gray-200 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Page Order</p>
            <div className="space-y-1">
              {blocks.map((b, i) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id === selectedId ? null : b.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition text-xs ${b.id === selectedId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: BLOCK_COLORS[b.type] }} />
                  <span className="font-medium capitalize truncate">{b.type}</span>
                  <span className="ml-auto text-gray-300 font-mono">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: Live Preview (Wix-style) ────────────────────────── */}
        <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-gray-400 font-mono min-w-48 text-center border border-gray-200">
                {(school as any).slug ? `${(school as any).slug}.sqoolify.com` : 'your-school.sqoolify.com'}
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-gray-200/60 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Desktop preview"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth={2}/><line x1="8" y1="21" x2="16" y2="21" strokeWidth={2}/><line x1="12" y1="17" x2="12" y2="21" strokeWidth={2}/></svg>
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ${previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile preview"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth={2}/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={2} strokeLinecap="round"/></svg>
                Mobile
              </button>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center text-center p-8 transition-colors ${activeDrag?.kind === 'palette' ? 'bg-blue-50' : ''}`}
              onDragOver={e => { if (activeDrag) e.preventDefault(); }}
              onDrop={e => {
                if (!activeDrag) return;
                e.preventDefault();
                if (activeDrag.kind === 'palette') addBlock(activeDrag.type);
                setActiveDrag(null);
                setDropTarget(null);
              }}
            >
              <div className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center mb-6 transition-colors ${activeDrag?.kind === 'palette' ? 'border-blue-400' : 'border-gray-300'}`}>
                <svg className={`w-8 h-8 transition-colors ${activeDrag?.kind === 'palette' ? 'text-blue-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h3 className="font-black text-gray-700 mb-2">Canvas is empty</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {activeDrag?.kind === 'palette' ? 'Drop here to add block' : 'Drag blocks from the left panel or click to add.'}
              </p>
            </div>
          ) : (
            <div
              ref={previewRef}
              className="flex-1 overflow-y-auto"
              onDragOver={e => { if (activeDrag) e.preventDefault(); }}
              onDrop={e => {
                // Only fires if NOT caught by a block (blocks call stopPropagation)
                if (!activeDrag) return;
                e.preventDefault();
                if (activeDrag.kind === 'palette') addBlock(activeDrag.type);
                setActiveDrag(null);
                setDropTarget(null);
              }}
            >
              {previewMode === 'mobile' ? (
                <div className="flex justify-center py-8 px-4 min-h-full">
                  <div className="rounded-[36px] border-[6px] border-gray-800 shadow-2xl overflow-hidden bg-gray-900 shrink-0" style={{ width: 320, zoom: 0.85 }}>
                    <div className="h-8 bg-gray-900 flex items-center justify-center">
                      <div className="w-16 h-4 bg-gray-800 rounded-full" />
                    </div>
                    <div className="bg-white overflow-y-auto" style={{ maxHeight: 620 }}>
                      <EditModeContext.Provider value={editCtxValue}>
                        <CanvasHomePage school={previewSchool} />
                      </EditModeContext.Provider>
                    </div>
                    <div className="h-5 bg-gray-900 flex items-center justify-center">
                      <div className="w-20 h-1 bg-gray-700 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ zoom: 0.65 }}>
                  <EditModeContext.Provider value={editCtxValue}>
                    <CanvasHomePage school={previewSchool} />
                  </EditModeContext.Provider>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Block List + Property Editor ─────────────────────── */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">

          {/* Block list / reorder panel */}
          <div className="border-b border-gray-200 shrink-0">
            <div className="px-4 py-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Blocks</p>
              <span className="text-xs font-bold text-gray-400">{blocks.length}</span>
            </div>
            <div className="max-h-48 overflow-y-auto px-3 pb-3 space-y-1">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => { dragRef.current = block.id; }}
                  onDragEnd={() => { dragRef.current = null; setDragOver(null); }}
                  onDragOver={e => { e.preventDefault(); setDragOver(block.id); }}
                  onDrop={() => handleDrop(block.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-default ${selectedId === block.id ? 'border-blue-400 bg-blue-50' : dragOver === block.id ? 'border-blue-300 bg-blue-50/50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                >
                  {/* Drag handle */}
                  <div className="cursor-grab text-gray-300 hover:text-gray-500 transition shrink-0" title="Drag to reorder">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zM16 6a2 2 0 110-4 2 2 0 010 4zM16 14a2 2 0 110-4 2 2 0 010 4zM16 22a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </div>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BLOCK_COLORS[block.type] }} />
                  <span className="flex-1 text-xs font-bold text-gray-700 capitalize truncate">{block.type}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition text-xs">↑</button>
                    <button onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition text-xs">↓</button>
                    <button onClick={() => setSelectedId(block.id === selectedId ? null : block.id)} className={`px-2 h-5 flex items-center rounded text-[10px] font-bold transition ${selectedId === block.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Edit</button>
                    <button onClick={() => removeBlock(block.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition text-sm">×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property editor */}
          <div className="flex-1 overflow-y-auto">
            {selectedBlock ? (
              <div>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${BLOCK_COLORS[selectedBlock.type]}15` }}>
                      {BLOCK_EMOJIS[selectedBlock.type]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 capitalize">{selectedBlock.type}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{blockPreview(selectedBlock)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                  >Done</button>
                </div>
                <div className="p-5 space-y-4">
                  <BlockPropertyEditor
                    block={selectedBlock}
                    onUpdate={(patch) => updateBlockData(selectedBlock.id, patch)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <p className="font-bold text-gray-700 text-sm mb-1">Select a block to edit</p>
                <p className="text-xs text-gray-400 leading-relaxed">Click any section in the preview or click "Edit" on a block to modify its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
