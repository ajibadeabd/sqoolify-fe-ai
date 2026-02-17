import type { GallerySectionContent } from '../../../lib/types';

export default function GallerySection({ content }: { content: GallerySectionContent }) {
  const images = content.images || [];

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-16">
            <div className="w-12 h-1 bg-blue-500 rounded-full mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {content.title}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100"
            >
              <img
                src={img.url}
                alt={img.caption || ''}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
