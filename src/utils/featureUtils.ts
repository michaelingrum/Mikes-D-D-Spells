import { CharacterFeature } from '../types';

export type FeatureSortOption =
  | 'custom'
  | 'short-first'
  | 'long-first'
  | 'name-asc'
  | 'name-desc'
  | 'depleted-first'
  | 'category';

export const SORT_OPTION_LABELS: Record<FeatureSortOption, string> = {
  custom: 'Custom Order',
  'short-first': 'Recharge: Short Rest First',
  'long-first': 'Recharge: Long Rest First',
  'name-asc': 'Name (A to Z)',
  'name-desc': 'Name (Z to A)',
  'depleted-first': 'Charges: Depleted First',
  category: 'Category (Class, Feat, Item...)',
};

export function sortFeaturesList(
  list: CharacterFeature[],
  sortType: FeatureSortOption
): CharacterFeature[] {
  const cloned = [...list];
  switch (sortType) {
    case 'short-first':
      return cloned.sort((a, b) => {
        const order: Record<string, number> = { short: 0, long: 1, special: 2, none: 3 };
        const valA = order[a.resetType] ?? 2;
        const valB = order[b.resetType] ?? 2;
        if (valA !== valB) return valA - valB;
        return a.name.localeCompare(b.name);
      });
    case 'long-first':
      return cloned.sort((a, b) => {
        const order: Record<string, number> = { long: 0, short: 1, special: 2, none: 3 };
        const valA = order[a.resetType] ?? 2;
        const valB = order[b.resetType] ?? 2;
        if (valA !== valB) return valA - valB;
        return a.name.localeCompare(b.name);
      });
    case 'name-asc':
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return cloned.sort((a, b) => b.name.localeCompare(a.name));
    case 'depleted-first':
      return cloned.sort((a, b) => {
        const ratioA = a.current / (a.max || 1);
        const ratioB = b.current / (b.max || 1);
        if (ratioA !== ratioB) return ratioA - ratioB;
        return a.name.localeCompare(b.name);
      });
    case 'category':
      return cloned.sort((a, b) => {
        const catA = a.category || 'other';
        const catB = b.category || 'other';
        if (catA !== catB) return catA.localeCompare(catB);
        return a.name.localeCompare(b.name);
      });
    case 'custom':
    default:
      return list;
  }
}
