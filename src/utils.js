import axios from 'axios';

export const PAGE_SIZE = 20;

const BASE_URL = 'https://pokeapi.co/api/v2';

export function formatName(name) {
  if (!name) return '';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatStatName(stat) {
  const statsMap = {
    hp: 'HP',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    attack: 'Atk',
    defense: 'Def',
    speed: 'Speed'
  };
  return statsMap[stat] || formatName(stat);
}

export function formatNumber(id) {
  return String(id).padStart(3, '0');
}

export function getTypeColor(type) {
  const colors = {
    fire: '#ff9c54',
    grass: '#78c850',
    water: '#6390f0',
    electric: '#f7d02c',
    ice: '#96d9d6',
    fighting: '#c22e28',
    poison: '#a33ea2',
    ground: '#e2bf65',
    flying: '#a98ff3',
    psychic: '#f95587',
    bug: '#a6b91a',
    rock: '#b6a136',
    ghost: '#735797',
    dragon: '#6f35fc',
    steel: '#b7b7ce',
    fairy: '#d685ad',
    normal: '#a8a878'
  };
  return colors[type?.toLowerCase()] || '#9099a1';
}

export async function get(endpoint) {
  try {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function loadPokemon(nameOrId) {
  const data = await get(`/pokemon/${nameOrId}`);
  if (!data) return null;

  const speciesData = await get(`/pokemon-species/${nameOrId}`);

  const descriptionEntry = speciesData?.flavor_text_entries?.find(
    (entry) => entry.language?.name === 'en'
  );
  const description = descriptionEntry
    ? descriptionEntry.flavor_text.replace(/[\r\n\f]+/g, ' ').replace(/\s+/g, ' ').trim()
    : 'No description available.';

  const genusEntry = speciesData?.genera?.find(
    (entry) => entry.language?.name === 'en'
  );
  const genus = genusEntry ? genusEntry.genus : 'Unknown';

  const captureRate = speciesData?.capture_rate ?? 0;

  const image =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default ||
    '';

  const abilities = (data.abilities || []).map((item) => ({
    name: formatName(item.ability.name),
    isHidden: item.is_hidden
  }));

  const stats = (data.stats || []).map((item) => ({
    name: formatStatName(item.stat.name),
    value: item.base_stat
  }));

  const totalStats = stats.reduce((sum, stat) => sum + stat.value, 0);

  return {
    id: data.id,
    displayName: formatName(data.name),
    types: (data.types || []).map((t) => t.type.name),
    genus,
    height: data.height / 10,
    weight: data.weight / 10,
    image,
    abilities,
    stats,
    totalStats,
    description,
    captureRate
  };
}

export async function loadMany(list) {
  if (!list || !Array.isArray(list)) return [];
  const results = await Promise.all(
    list.map((item) => loadPokemon(typeof item === 'string' ? item : item.name))
  );
  return results.filter(Boolean);
}