import axios from 'axios';

// Known stat name mappings for formatStatName
const STAT_NAME_MAP = {
  hp: 'HP',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def'
};

// Known type hex colors for getTypeColor
const TYPE_COLORS = {
  fire: '#ff9c54',
  normal: '#9099a1',
  electric: '#f3d23b',
  water: '#4d90d5',
  grass: '#63bb5b',
  ice: '#74cea4',
  fighting: '#ce4069',
  poison: '#ab6ac8',
  ground: '#d97746',
  flying: '#8fa8dd',
  psychic: '#f97176',
  bug: '#91c12f',
  rock: '#c5b78c',
  ghost: '#5269ac',
  dragon: '#0a6dc4',
  steel: '#5a8ea1',
  fairy: '#ec8fe6',
  dark: '#5a5366'
};

export function formatName(name) {
  if (!name) return '';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatStatName(statName) {
  return STAT_NAME_MAP[statName] || formatName(statName);
}

export function formatNumber(number) {
  return String(number).padStart(3, '0');
}

export function getTypeColor(type) {
  return TYPE_COLORS[type?.toLowerCase()] || '#9099a1';
}

export async function get(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function loadPokemon(nameOrId) {
  const data = await get(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
  if (!data) return null;

  const speciesData = await get(`https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`);

  const englishFlavor = speciesData?.flavor_text_entries?.find(
    (entry) => entry.language?.name === 'en'
  );
  const description = englishFlavor
    ? englishFlavor.flavor_text
        .replace(/[\n\r\f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : 'No description available.';

  const englishGenus = speciesData?.genera?.find((g) => g.language?.name === 'en');
  const genus = englishGenus ? englishGenus.genus : 'Unknown';

  return {
    id: data.id,
    name: data.name,
    displayName: formatName(data.name),
    types: data.types ? data.types.map((t) => t.type.name) : [],
    genus,
    height: data.height / 10,
    weight: data.weight / 10,
    image:
      data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '',
    abilities: data.abilities
      ? data.abilities.map((a) => ({
          name: formatName(a.ability.name),
          isHidden: a.is_hidden
        }))
      : [],
    stats: data.stats
      ? data.stats.map((s) => ({
          name: formatStatName(s.stat.name),
          value: s.base_stat
        }))
      : [],
    totalStats: data.stats ? data.stats.reduce((sum, s) => sum + s.base_stat, 0) : 0,
    description,
    captureRate: speciesData?.capture_rate ?? 0
  };
}

export async function loadMany(list) {
  if (!Array.isArray(list)) return [];
  const results = await Promise.all(list.map((item) => loadPokemon(item.name || item)));
  return results.filter(Boolean);
}
