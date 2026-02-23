import type { CanvasBlock } from '../../../../lib/types';

export const DEFAULT_CANVAS_BLOCKS: CanvasBlock[] = [
  {
    id: 'default-hero',
    type: 'hero',
    data: {
      layout: 'split',
      headline: 'Shaping Tomorrow\'s Leaders',
      subheadline: 'Today',
      description: 'A world-class education that prepares students for life beyond the classroom.',
      buttonText: 'Apply Now',
      buttonLink: '/admissions',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
    },
  },
  {
    id: 'default-stats',
    type: 'stats',
    data: {
      items: [
        { value: '1,200+', label: 'Enrolled Students' },
        { value: '98%', label: 'Pass Rate' },
        { value: '40+', label: 'Subjects Offered' },
        { value: '25 yrs', label: 'Of Excellence' },
      ],
    },
  },
  {
    id: 'default-features',
    type: 'features',
    data: {
      badge: 'Why Choose Us',
      heading: 'Everything your child needs to thrive',
      items: [
        { iconName: 'curriculum', title: 'Academic Excellence', desc: 'Rigorous curriculum designed for holistic development and university readiness.' },
        { iconName: 'community', title: 'Strong Community', desc: 'A safe, inclusive environment where every student belongs and is celebrated.' },
        { iconName: 'achievement', title: 'Proven Results', desc: 'Consistently high pass rates and top placements in leading universities.' },
      ],
    },
  },
  {
    id: 'default-cta',
    type: 'cta',
    data: {
      badge: 'Admissions Open',
      headline: 'Begin your journey\nwith us today',
      description: 'Applications for the new academic year are now open. Secure your child\'s future at our institution.',
      buttonText: 'Apply Now',
      buttonLink: '/admissions',
    },
  },
];
