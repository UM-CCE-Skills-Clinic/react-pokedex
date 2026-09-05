# 04 - Shared Helpers

Time to write real code. `src/utils.js` is the only file that talks to PokeAPI, and it holds the formatting helpers every page needs.

We build it in five pieces. Create the file first, then add each piece to the bottom as you go.

---

## Step 1: Create the File

Create `src/utils.js` and start it with:

```javascript
import axios from 'axios';

// Shared helpers. Each page does its own loading with useState and useEffect,
// but they all use the small functions here so the same code is not repeated.

export const BASE_URL = 'https://pokeapi.co/api/v2';

// How many Pokemon we show on one page.
export const PAGE_SIZE = 20;
```

**`export`** means other files may import this. Anything without `export` stays private to this file.

`PAGE_SIZE` lives here because three different pages need to agree on it. Change it once and pagination updates everywhere.

---

## Step 2: Add the Type Colours

Each Pokemon type has its own colour — fire is orange, water is blue. Add this below what you have:

```javascript
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
```

### Why the fallback?

`typeColors['banana']` is `undefined`, and `undefined || '#9099a1'` gives grey. Without that `||`, an unexpected type would produce `background-color: undefined` and the card would render with no colour at all.

Note that `typeColors` is **not** exported — nothing outside this file needs the whole table, only `getTypeColor`.

---

## Step 3: Add the Name Formatters

The API gives us machine-friendly text like `mr-mime` and `special-attack`. These make it human-friendly:

```javascript
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
```

### How `formatName` works

Follow `"mr-mime"` through it:

| Step                                    | Result           |
| --------------------------------------- | ---------------- |
| `.split('-')`                           | `['mr', 'mime']` |
| `.map(...)` uppercases the first letter | `['Mr', 'Mime']` |
| `.join(' ')`                            | `'Mr Mime'`      |

`formatStatName` looks in the table first — `"hp"` should be `"HP"`, not `"Hp"` — and falls back to `formatName` for anything not listed.

`formatNumber` pads with zeros so Pokedex numbers line up as `#001`, `#025`, `#150`.

---

## Step 4: Add `get` — One Request to the API

This is the single function every API call goes through:

```javascript
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
```

### The important idea here

There are **two different kinds of failure**, and they deserve different treatment:

| Situation                        | HTTP status   | What we do    | What the user sees  |
| -------------------------------- | ------------- | ------------- | ------------------- |
| Someone typed `/pokemon/notreal` | 404           | return `null` | "Pokemon not found" |
| No internet, or PokeAPI is down  | anything else | `throw`       | "Please try again"  |

A typo isn't a crash — it's an ordinary thing users do. By returning `null` for 404s, pages can tell the two apart with a simple `if (result === null)`.

`axios` puts the response on the error object, so `error.response.status` is how we check. We test `error.response &&` first because a network failure has no response at all.

---

## Step 5: Add `buildPokemon` — Tidy Up the Mess

The API's shape is awkward to use in markup. This flattens it:

```javascript
// The API answers are big and awkward, so build one tidy object out of them.
function buildPokemon(pokemon, species) {
  // The description comes as a list of entries in many languages.
  const englishEntry = species?.flavor_text_entries.find((entry) => entry.language.name === 'en');

  // That text still has line breaks from the original games, so clean them up.
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

    // The official artwork looks best, but not every Pokemon has one.
    image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,

    types: pokemon.types.map((entry) => entry.type.name),

    height: pokemon.height / 10, // the API uses decimetres
    weight: pokemon.weight / 10, // the API uses hectograms

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
```

### Before and after

| The API gives us                          | We turn it into                        |
| ----------------------------------------- | -------------------------------------- |
| `types: [{ type: { name: 'electric' } }]` | `types: ['electric']`                  |
| `height: 4` (decimetres)                  | `height: 0.4` (metres)                 |
| `weight: 60` (hectograms)                 | `weight: 6` (kilograms)                |
| `name: 'mr-mime'`                         | `displayName: 'Mr Mime'`               |
| description buried in 200 languages       | `description: 'It raises its tail...'` |

Now a component can just write `{pokemon.displayName}` instead of digging through nested objects.

### Three details worth understanding

**`species?.flavor_text_entries`** — the `?.` is _optional chaining_. If `species` is `null`, the whole expression is `undefined` instead of crashing. We need this because some Pokemon have no species entry (more on that in the next step).

**`.replace(/[\f\n\r]/g, ' ')`** — the descriptions come straight from the original Game Boy games and still contain the line breaks that fit the old text boxes. This swaps them for spaces.

**`|| pokemon.sprites.front_default`** — we prefer the big official artwork, but a few Pokemon don't have one, so we fall back to the small sprite.

`buildPokemon` is **not** exported. It's a helper for the function we write next.

---

## Step 6: Add `loadPokemon` and `loadMany`

Finally, the two functions the pages actually call:

```javascript
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
```

### Why two requests in `loadPokemon`

The stats and picture come from `/pokemon/pikachu`; the description and category come from `/pokemon-species/25`. We fetch both and merge them.

### The `charizard-mega-x` case

Special forms like Mega Charizard have IDs like `10034`. There _is_ a Pokemon at `/pokemon/charizard-mega-x`, but there is **no** `/pokemon-species/10034` — that returns 404.

Because `get` turns a 404 into `null` rather than throwing, and `buildPokemon` uses `species?.` and `species ? ... : ...` everywhere, the app handles this gracefully: you get the Pokemon with "No description available." instead of a crash. This exact case is covered by one of the tests.

### Why `Promise.all` matters

Compare loading 20 Pokemon:

```javascript
// Slow — waits for each one before starting the next (about 20 x 200ms = 4s)
for (const entry of entries) {
  results.push(await loadPokemon(entry.name));
}

// Fast — starts all 20 at once, waits for the slowest (about 400ms)
await Promise.all(entries.map((entry) => loadPokemon(entry.name)));
```

The `.filter(...)` at the end drops any that came back `null`, so a single missing Pokemon never leaves a hole in the grid.

---

## Step 7: Commit Your Progress

```bash
git add .
git commit -m "feat: add shared helpers for formatting and pokeapi"
```

---

## What's Next?

Data loading is done, and it's the last shared piece we need. From here on, every part builds one complete feature — and ends with you seeing it work.

Next: [05 - Feature 1: Browse the Pokedex](./05-feature-browse-pokedex.md)
