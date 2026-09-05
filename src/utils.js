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
// ---------------------------------------------------------------------------
// Loading data from PokeAPI
// ---------------------------------------------------------------------------

// Ask the API for one thing. Returns null if it does not exist, because a
// missing Pokemon is a normal thing to happen, not a crash.
export async function get(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    // Anything else (no internet, server down) is a real problem, so pass it on.
    throw error;
  }
}
// ---------------------------------------------------------------------------
// Loading data from PokeAPI
// ---------------------------------------------------------------------------

// Ask the API for one thing. Returns null if it does not exist, because a
// missing Pokemon is a normal thing to happen, not a crash.
export async function get(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    // Anything else (no internet, server down) is a real problem, so pass it on.
    throw error;
  }
}
// Load one Pokemon with all of its details.
// Returns null if there is no Pokemon with that name or id.
export async function loadPokemon(nameOrId) {
  const pokemon = await get(`/pokemon/${nameOrId}`);

  if (pokemon === null) {
    return null;
  }

  // Special forms like "charizard-mega-x" have no species entry of their own.
  // That is fine - buildPokemon copes with a null species.
  const species = await get(`/pokemon-species/${pokemon.id}`);

  return buildPokemon(pokemon, species);
}

// The list endpoints only give us names, so we load the details for each one.
// Promise.all runs those requests at the same time, not one after another.
export async function loadMany(entries) {
  const results = await Promise.all(entries.map((entry) => loadPokemon(entry.name)));
  return results.filter((pokemon) => pokemon !== null);
}