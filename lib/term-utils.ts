const TERM_NAMES = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'] as const;

const TERM_COLOR_CYCLE = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-600' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-600' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', badge: 'bg-pink-600' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-600' },
];

export type TermColor = typeof TERM_COLOR_CYCLE[number];

export function getTermName(index: number): string {
  return TERM_NAMES[index] || `Term ${index + 1}`;
}

export function getTermColor(index: number): TermColor {
  return TERM_COLOR_CYCLE[index % TERM_COLOR_CYCLE.length];
}

export function getTermColorByName(name: string): TermColor {
  const idx = TERM_NAMES.indexOf(name as any);
  return getTermColor(idx >= 0 ? idx : 0);
}

export function getTermOptions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    value: getTermName(i),
    label: `${getTermName(i)} Term`,
    color: getTermColor(i),
  }));
}
