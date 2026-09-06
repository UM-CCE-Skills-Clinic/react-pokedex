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