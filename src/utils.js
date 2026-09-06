import axios from 'axios';

// Shared helpers. Each page does its own loading with useState and useEffect,
// but they all use the small functions here so the same code is not repeated.
export const BASE_URL = 'https://pokeapi.co/api/v2';

// How many Pokemon we show on one page.
export const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

// The colour used for each Pokemon type.
const typeColors = {
  normal: '#9099a1',
  fire: '#ff9c54',
  water: '#4d90d5',
  electric: '#f3d23b',
  grass: '#63bb5b',
  ice: '#74cec0',
  fighting: '#ce4069',
  poison: '#ab6ac8',
  ground: '#d97746',
  flying: '#8fa8dd',
  psychic: '#f97176',
  bug: '#90c12c',
  rock: '#c7b78b',
  ghost: '#5269ad',
  dragon: '#0a6dc4',
  dark: '#5a5366',
  steel: '#5a8ea1',
  fairy: '#ec8fe6'
};

// Grey is the fallback for anything unexpected.
export function getTypeColor(type) {
  return typeColors[type] || '#9099a1';
}

// "mr-mime" -> "Mr Mime"
export function formatName(name) {
  return name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

// The API uses names like "special-attack"; these are nicer to read.
const statNames = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed'
};

export function formatStatName(name) {
  return statNames[name] || formatName(name);
}

// 25 -> "025"
export function formatNumber(id) {
  return String(id).padStart(3, '0');
}

// ---------------------------------------------------------------------------
// Loading data from PokeAPI
// ---------------------------------------------------------------------------

// Ask the API for one thing. Returns null if it does not exist.
export async function get(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

// The API answers are big and awkward, so build one tidy object out of them.
function buildPokemon(pokemon, species) {
  const englishEntry = species?.flavor_text_entries.find((entry) => entry.language.name === 'en');

  const description = englishEntry
    ? englishEntry.flavor_text.replace(/[\f\n\r]/g, ' ')
    : 'No description available.';

  const englishGenus = species?.genera.find((entry) => entry.language.name === 'en');

  const stats = pokemon.stats.map((entry) => ({
    name: formatStatName(entry.stat.name),
    value: entry.base_stat
  }));

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatName(pokemon.name),
    image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
    types: pokemon.types.map((entry) => entry.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    abilities: pokemon.abilities.map((entry) => ({
      name: formatName(entry.ability.name),
      isHidden: entry.is_hidden
    })),
    stats,
    totalStats: stats.reduce((total, stat) => total + stat.value, 0),
    description,
    genus: englishGenus ? englishGenus.genus : 'Unknown',
    captureRate: species ? species.capture_rate : 0,
    baseHappiness: species ? species.base_happiness : 0
  };
}

// Load one Pokemon with all of its details.
export async function loadPokemon(nameOrId) {
  const pokemon = await get(`/pokemon/${nameOrId}`);

  if (pokemon === null) {
    return null;
  }

  const species = await get(`/pokemon-species/${pokemon.id}`);

  return buildPokemon(pokemon, species);
}

// Load details for a list of Pokemon simultaneously.
export async function loadMany(entries) {
  const results = await Promise.all(entries.map((entry) => loadPokemon(entry.name)));
  return results.filter((pokemon) => pokemon !== null);
}