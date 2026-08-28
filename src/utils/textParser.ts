import { SchoolCode, SpellComponents, SpellDuration, SpellRange, SpellTime } from '../types';

export const SCHOOL_MAP: Record<string, { name: string; short: string; color: string; bgLight: string; border: string; glow: string }> = {
  A: { name: 'Abjuration', short: 'Abj', color: 'text-sky-400', bgLight: 'bg-sky-950/50', border: 'border-sky-700/50', glow: 'shadow-sky-500/20' },
  C: { name: 'Conjuration', short: 'Conj', color: 'text-amber-400', bgLight: 'bg-amber-950/50', border: 'border-amber-700/50', glow: 'shadow-amber-500/20' },
  D: { name: 'Divination', short: 'Div', color: 'text-teal-300', bgLight: 'bg-teal-950/50', border: 'border-teal-700/50', glow: 'shadow-teal-500/20' },
  E: { name: 'Enchantment', short: 'Ench', color: 'text-pink-400', bgLight: 'bg-pink-950/50', border: 'border-pink-700/50', glow: 'shadow-pink-500/20' },
  V: { name: 'Evocation', short: 'Evoc', color: 'text-rose-400', bgLight: 'bg-rose-950/50', border: 'border-rose-700/50', glow: 'shadow-rose-500/20' },
  I: { name: 'Illusion', short: 'Illus', color: 'text-purple-400', bgLight: 'bg-purple-950/50', border: 'border-purple-700/50', glow: 'shadow-purple-500/20' },
  N: { name: 'Necromancy', short: 'Necro', color: 'text-emerald-400', bgLight: 'bg-emerald-950/50', border: 'border-emerald-700/50', glow: 'shadow-emerald-500/20' },
  T: { name: 'Transmutation', short: 'Trans', color: 'text-orange-400', bgLight: 'bg-orange-950/50', border: 'border-orange-700/50', glow: 'shadow-orange-500/20' },
};

export function getSchoolInfo(schoolCode: SchoolCode) {
  const code = (schoolCode || '').toUpperCase().trim();
  if (SCHOOL_MAP[code]) {
    return SCHOOL_MAP[code];
  }
  // Try matching full name
  const found = Object.values(SCHOOL_MAP).find(s => s.name.toLowerCase() === code.toLowerCase());
  if (found) return found;

  return {
    name: schoolCode || 'Universal',
    short: (schoolCode || 'Univ').slice(0, 4),
    color: 'text-slate-300',
    bgLight: 'bg-slate-800/60',
    border: 'border-slate-700',
    glow: 'shadow-slate-500/20',
  };
}

export function formatSpellLevel(level: number): string {
  if (level === 0) return 'Cantrip';
  if (level === 1) return '1st Level';
  if (level === 2) return '2nd Level';
  if (level === 3) return '3rd Level';
  return `${level}th Level`;
}

export function formatShortSpellLevel(level: number): string {
  if (level === 0) return 'CANTRIP';
  if (level === 1) return '1ST LVL';
  if (level === 2) return '2ND LVL';
  if (level === 3) return '3RD LVL';
  return `${level}TH LVL`;
}

export function formatCastingTime(time: SpellTime[] | undefined): string {
  if (!time || time.length === 0) return '1 Action';
  return time.map(t => {
    let base = `${t.number} ${t.unit}`;
    if (t.condition) {
      base += ` (${t.condition})`;
    }
    return base;
  }).join(', ');
}

export function formatRange(range: SpellRange | undefined): string {
  if (!range) return 'Self';
  if (range.type === 'point' && range.distance) {
    if (range.distance.type === 'touch') return 'Touch';
    if (range.distance.type === 'self') return 'Self';
    if (range.distance.amount) return `${range.distance.amount} ${range.distance.type || 'feet'}`;
    return range.distance.type;
  }
  if (range.type === 'cone' && range.distance) {
    return `Self (${range.distance.amount || 15}-ft cone)`;
  }
  if (range.type === 'sphere' && range.distance) {
    return `Self (${range.distance.amount || 30}-ft sphere)`;
  }
  if (range.type === 'line' && range.distance) {
    return `Self (${range.distance.amount || 100}-ft line)`;
  }
  if (range.type === 'radius' && range.distance) {
    return `Self (${range.distance.amount || 10}-ft radius)`;
  }
  if (range.type === 'sight') return 'Sight';
  if (range.type === 'special') return 'Special';
  return range.type || 'Self';
}

export function formatComponents(components: SpellComponents | undefined): { label: string; details?: string; hasCost: boolean } {
  if (!components) return { label: 'None', hasCost: false };
  const parts: string[] = [];
  if (components.v) parts.push('V');
  if (components.s) parts.push('S');
  let details: string | undefined;
  let hasCost = false;

  if (components.m) {
    parts.push('M');
    if (typeof components.m === 'string') {
      details = components.m;
    } else if (typeof components.m === 'object') {
      details = components.m.text;
      if (components.m.cost) {
        hasCost = true;
      }
    }
  }

  return {
    label: parts.length > 0 ? parts.join(', ') : 'None',
    details,
    hasCost
  };
}

export function formatDuration(duration: SpellDuration[] | undefined): { text: string; isConcentration: boolean } {
  if (!duration || duration.length === 0) return { text: 'Instantaneous', isConcentration: false };
  const d = duration[0];
  let text = 'Instantaneous';
  const isConcentration = Boolean(d.concentration);

  if (d.type === 'instant') {
    text = 'Instantaneous';
  } else if (d.type === 'timed' && d.duration) {
    text = `${d.duration.amount} ${d.duration.type}${d.duration.amount > 1 ? 's' : ''}`;
  } else if (d.type === 'permanent') {
    text = 'Until Dispelled';
  } else if (d.type === 'special') {
    text = 'Special';
  }

  return {
    text: isConcentration ? `Concentration, up to ${text}` : text,
    isConcentration
  };
}

/**
 * Clean 5etools syntax tags into clean readable text
 * Examples:
 * {@variantrule Initiative|XPHB} -> Initiative
 * {@creature Construct Spirit|XPHB} -> Construct Spirit
 * {@damage 3d8} -> 3d8
 * {@scaledamage 8d6|3-9|1d6} -> 1d6
 * {@condition Blinded|XPHB} -> Blinded
 * {@spell Remove Curse|XPHB} -> Remove Curse
 * {@skill Athletics|XPHB} -> Athletics
 * {@action Dodge|XPHB} -> Dodge
 * {@book school of magic|XPHB|7|Schools of Magic} -> school of magic
 */
export function clean5eTags(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // scaledamage tags: {@scaledamage 8d6|3-9|1d6} -> 1d6 (or base text)
    .replace(/\{@scaledamage\s+[^|]+\|[^|]+\|([^}]+)\}/gi, '$1')
    .replace(/\{@scaledice\s+[^|]+\|[^|]+\|([^}]+)\}/gi, '$1')
    // general tags: {@tag text|source|etc} -> text
    .replace(/\{@(creature|spell|item|condition|action|skill|sense|variantrule|book|dice|damage|d20|hazard|table|background|feat|reward|optfeature)\s+([^}|]+)(?:\|[^}]*)?\}/gi, '$2')
    // fallback for any other tag {@tag ...}
    .replace(/\{@[a-zA-Z0-9_-]+\s+([^}]+)\}/gi, (match, p1) => {
      const parts = p1.split('|');
      return parts[0] || match;
    })
    // clean multiple spaces
    .replace(/\s{2,}/g, ' ');
}

export function parseEntries(entries: (string | { type: string; name?: string; entries?: (string | object)[] })[]): Array<{ title?: string; text: string }> {
  if (!entries || !Array.isArray(entries)) return [];
  const result: Array<{ title?: string; text: string }> = [];

  for (const entry of entries) {
    if (typeof entry === 'string') {
      result.push({ text: clean5eTags(entry) });
    } else if (typeof entry === 'object' && entry !== null) {
      const title = entry.name ? clean5eTags(entry.name) : undefined;
      let text = '';
      if (entry.entries && Array.isArray(entry.entries)) {
        text = entry.entries
          .map(e => (typeof e === 'string' ? clean5eTags(e) : JSON.stringify(e)))
          .join('\n\n');
      }
      result.push({ title, text });
    }
  }

  return result;
}
