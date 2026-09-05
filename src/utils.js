import axios from 'axios';

// Shared helpers. Each page does its own loading with useState and useEffect,
// but they all use the small functions here so the same code is not repeated.

export const BASE_URL = 'https://pokeapi.co/api/v2';

// How many Pokemon we show on one page.
export const PAGE_SIZE = 20;