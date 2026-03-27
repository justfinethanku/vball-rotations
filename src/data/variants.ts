import { VariantId } from '@/lib/types';

export interface VariantMeta {
  id: VariantId;
  name: string;
  description: string;
  system: '5-1' | '6-2';
}

export const VARIANTS: VariantMeta[] = [
  { id: 'standard', name: 'Standard 5-1', description: 'Traditional setter penetration to zone 2/3', system: '5-1' },
  { id: 'spread', name: 'Spread 5-1', description: 'Wider outside spacing, quicker middle tempo', system: '5-1' },
  { id: 'slide', name: 'Slide-Heavy 5-1', description: 'Middle runs slides behind the setter', system: '5-1' },
  { id: 'reverse', name: 'Reverse 5-1', description: 'Setter penetrates to zone 4 side', system: '5-1' },
];

export function getVariantsForSystem(system: '5-1' | '6-2'): VariantMeta[] {
  return VARIANTS.filter(v => v.system === system);
}
