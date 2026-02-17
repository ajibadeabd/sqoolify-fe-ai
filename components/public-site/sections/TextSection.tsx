import type { TextSectionContent } from '../../../lib/types';

export default function TextSection({ content }: { content: TextSectionContent }) {
  const alignment = content.alignment || 'left';
  const textAlign = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
  const accentAlign = alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : '';

  return (
    <section className="px-6 py-20 bg-white">
      <div className={`max-w-4xl mx-auto ${textAlign}`}>
        {content.title && (
          <>
            <div className={`w-12 h-1 bg-blue-500 rounded-full mb-6 ${accentAlign}`} />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 tracking-tight">
              {content.title}
            </h2>
          </>
        )}
        <div className="text-gray-600 leading-[1.9] whitespace-pre-wrap text-lg">
          {content.content}
        </div>
      </div>
    </section>
  );
}
