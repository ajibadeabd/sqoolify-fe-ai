import { useContext } from 'react';
import type { PublicSchool, SitePage, CanvasBlockType } from '../../../../lib/types';
import { EditModeContext, EditableBlockWrapper, renderBlock } from './blocks';
import { DEFAULT_CANVAS_BLOCKS } from './defaultBlocks';

export default function HomePage({ school, sitePage }: { school: PublicSchool; sitePage?: SitePage }) {
  const pc = school.siteConfig?.primaryColor || '#23b864';
  const editCtx = useContext(EditModeContext);
console.log({siteConfig:school.siteConfig})
  const blocks = editCtx?.isEditMode
    ? editCtx.blocks
    : sitePage?.sections?.length
      ? sitePage.sections.map((s, i) => ({ id: `${s.type}-${i}`, type: s.type as CanvasBlockType, data: { ...s.content } }))
      : DEFAULT_CANVAS_BLOCKS;

  if (!blocks.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: pc }}>Canvas Template</p>
        <h2 className="text-3xl font-black text-gray-900 mb-3">Your page is empty</h2>
        <p className="text-gray-400">Open the Canvas Editor to start building your homepage.</p>
      </div>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        const rendered = renderBlock(block, pc);
        if (!editCtx?.isEditMode) {
          return <div key={block.id}>{rendered}</div>;
        }
        return (
          <EditableBlockWrapper key={block.id} block={block}>
            {rendered}
          </EditableBlockWrapper>
        );
      })}
    </>
  );
}
