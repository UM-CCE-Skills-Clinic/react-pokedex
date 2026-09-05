# 06 - Feature 2: Pokemon Details

Right now clicking a card says "Page not found". This feature makes it open a full detail page.

Same three steps: **Page → Route → Components**.

---

## What You'll See At The End

Click any card and get its own page with:

- a big type-coloured panel with the artwork, number, name and category
- the Pokedex description
- height, weight, capture rate and happiness
- ability chips, with a **Hidden** badge where it applies
- base stat bars that animate up from empty

And a typo like `/pokemon/notreal` gives a friendly "Pokemon not found".

---

## Step 1: The Page

Create `src/pages/PokemonDetailsPage.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail';
import { ErrorMessage, Loading } from '../components/ui';
import { loadPokemon } from '../utils';

// Everything about one Pokemon, e.g. "/pokemon/pikachu".
export default function PokemonDetailsPage() {
  // `nameOrId` comes from the route "/pokemon/:nameOrId".
  const { nameOrId } = useParams();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        // This is null when there is no Pokemon with that name or id.
        const result = await loadPokemon(nameOrId);

        if (!ignore) {
          setPokemon(result);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('We could not load this Pokemon. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [nameOrId]);

  // Handling each case with its own early return keeps the JSX below simple.
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage title="Could not load this Pokemon" text={error} />;
  }

  if (pokemon === null) {
    return (
      <ErrorMessage
        title="Pokemon not found"
        text={`There is no Pokemon with the name or ID "${nameOrId}".`}
      />
    );
  }

  return (
    <div>
      <Link to="/" className="text-sm font-semibold text-slate-500">
        ← Back to Pokedex
      </Link>

      <PokemonDetail pokemon={pokemon} />
    </div>
  );
}
```

Notice it's the **same shape** as `HomePage`: three pieces of state, one effect, one cleanup. Only two things differ.

### `useParams` instead of `useSearchParams`

Two different parts of the address:

| Hook              | Reads                   | Address            | Result                    |
| ----------------- | ----------------------- | ------------------ | ------------------------- |
| `useParams`       | part of the **path**    | `/pokemon/pikachu` | `{ nameOrId: 'pikachu' }` |
| `useSearchParams` | the **query** after `?` | `/?page=3`         | `'3'`                     |

The name `nameOrId` isn't arbitrary — it must match the route we write in Step 2.

### Four outcomes, four early returns

**This is the important part of this page.** There are two different kinds of failure, and confusing them makes for a bad app:

| Situation       | State               | Message                                           |
| --------------- | ------------------- | ------------------------------------------------- |
| Still working   | `loading` is true   | spinner                                           |
| Network broke   | `error` is set      | "Please try again" — retrying may help            |
| No such Pokemon | `pokemon` is `null` | "Pokemon not found" — a typo; retrying won't help |
| All good        | we have a Pokemon   | the detail card                                   |

This only works because of a decision made back in Part 04: `get()` returns `null` for a 404 instead of throwing. That's what lets this page tell "doesn't exist" apart from "went wrong".

**Order matters.** `loading` is checked first, because while loading `pokemon` is _also_ `null` — check it the other way round and you'd flash "not found" on every page load.

Using early returns keeps the final markup clean: deal with the exceptional cases first, and let the normal case be the last thing in the function.

---

## Step 2: The Route

Open `src/App.jsx` and add the import plus one route. The new lines are marked:

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import PokemonDetailsPage from './pages/PokemonDetailsPage'; // ← add this
import { ErrorMessage } from './components/ui';

// This is the list of pages in the app, and the address each one lives at.
// ":nameOrId" is a placeholder - the page reads it with useParams.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} /> {/* ← add this */}
          {/* "*" matches any address we did not list above. */}
          <Route
            path="*"
            element={
              <ErrorMessage
                title="Page not found"
                text="The page you are looking for does not exist."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

> Add new routes **above** the `*` route, so the file stays easy to read. (React Router picks the best match regardless of order, so this is for humans, not the computer.)

### Placeholders in a path

```jsx
<Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
```

A segment starting with `:` matches anything and hands you the value:

| Address            | React Router gives you    |
| ------------------ | ------------------------- |
| `/pokemon/pikachu` | `{ nameOrId: 'pikachu' }` |
| `/pokemon/25`      | `{ nameOrId: '25' }`      |

**The names must match exactly.** `path="/pokemon/:nameOrId"` pairs with `const { nameOrId } = useParams()`. Write `:pokemonName` in the route and `nameOrId` in the page, and you get `undefined`.

This is also why the cards in Feature 1 linked to `` `/pokemon/${pokemon.name}` `` — they were already pointing here, waiting for the route to exist.

---

## Step 3: The Component

One file, but we split it into four small components inside it. Written as one function this would be 120 lines of nested markup; split up, each piece has an obvious job:

```
PokemonDetail          the outer card, arranges the two columns
├── Hero               left column: picture, name, number, types
├── Facts              height, weight, capture rate, happiness
├── Abilities          ability chips, with a "Hidden" badge
└── Stats              the animated stat bars
```

Create `src/components/PokemonDetail.jsx`:

```jsx
import { formatNumber, getTypeColor } from '../utils';

// The big card on the details page. It is split into small pieces below so
// each part stays short and easy to follow.

// The highest a base stat can go, used to work out how full each bar is.
const MAX_STAT = 255;

function Hero({ pokemon, color }) {
  return (
    <div className="flex flex-col items-center gap-5 p-8" style={{ backgroundColor: color }}>
      <div className="flex w-full items-center justify-between text-white">
        <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold">
          #{formatNumber(pokemon.id)}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <img
        src={pokemon.image}
        alt={pokemon.displayName}
        className="h-56 w-56 object-contain drop-shadow-lg"
      />

      <div className="text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">{pokemon.displayName}</h1>
        <p className="mt-1 text-sm text-white/80">{pokemon.genus}</p>
      </div>
    </div>
  );
}

function Facts({ pokemon }) {
  // Building a list first means we only write the box markup once.
  const facts = [
    { label: 'Height', value: `${pokemon.height} m` },
    { label: 'Weight', value: `${pokemon.weight} kg` },
    { label: 'Capture rate', value: pokemon.captureRate },
    { label: 'Happiness', value: pokemon.baseHappiness }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {fact.label}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}

function Abilities({ abilities }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Abilities</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {abilities.map((ability) => (
          <span
            key={ability.name}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700"
          >
            {ability.name}
            {ability.isHidden && (
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-600">
                Hidden
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats({ pokemon, color }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Base stats</h2>
        <span className="text-sm font-bold text-slate-900">
          Total <span style={{ color }}>{pokemon.totalStats}</span>
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {pokemon.stats.map((stat) => (
          <div key={stat.name} className="grid grid-cols-[72px_1fr_44px] items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">{stat.name}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="stat-bar h-full rounded-full"
                style={{ width: `${(stat.value / MAX_STAT) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-right text-sm font-bold text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PokemonDetail({ pokemon }) {
  const color = getTypeColor(pokemon.types[0]);

  return (
    <article className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
        <Hero pokemon={pokemon} color={color} />

        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Pokedex entry
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">{pokemon.description}</p>
          </div>

          <Facts pokemon={pokemon} />
          <Abilities abilities={pokemon.abilities} />
          <Stats pokemon={pokemon} color={color} />
        </div>
      </div>
    </article>
  );
}
```

### Read the bottom function first

`PokemonDetail` is a summary of the whole page: hero, description, facts, abilities, stats. That readability is the payoff for splitting it up. Only it is exported — the other four are private helpers.

### `color` is passed down, not recalculated

`PokemonDetail` works out the colour once and hands it to both `Hero` and `Stats`, so the two can never disagree.

### `MAX_STAT`

A **named constant**. Writing `255` inside the maths would be a "magic number" — a value with no explanation.

### Build an array, then map over it

All four fact boxes look identical; only the label and value differ. Describing them as data and mapping once means adding a fifth fact is one line.

### Showing something only sometimes

```jsx
{
  ability.isHidden && <span>Hidden</span>;
}
```

The `&&` trick again: if the left side is false React draws nothing.

> **One catch:** `&&` with a **number** can bite you. `{items.length && <List />}` renders a literal `0` when the array is empty, because `0` is falsy but still displayable. Use `items.length > 0 && ...`. With booleans like `isHidden` you're safe.

### How a stat bar works

Two nested divs: the outer is the grey track (`overflow-hidden`), the inner is the coloured fill with a percentage width.

```
(stat.value / MAX_STAT) * 100
(35        / 255      ) * 100  =  13.7%
```

The three-column grid keeps them aligned:

```
grid-cols-[72px_1fr_44px]
           ↑     ↑    ↑
        label   bar  value
```

Fixed widths for label and value; `1fr` gives the bar whatever's left. That's what turns the rows into a neat chart.

**The animation** comes from the `stat-bar` class you wrote in `src/index.css` back in Part 03. The keyframe only says where to start (`width: 0`), so the browser animates from empty up to the inline width. No JavaScript, no state.

### `bg-white/25` and `text-white/80`

The `/25` is opacity. White at 25% is a frosted look that works on top of _any_ type colour — which is why the badges here don't need their own colours like the grid badges did.

### `style={{ color }}`

Shorthand: in JavaScript `{ color }` means `{ color: color }` when the variable is already named `color`.

### Two columns, only on wide screens

```
lg:grid-cols-[minmax(0,420px)_1fr]
```

Only at `lg:` does this split into two columns — the hero up to 420px, details taking the rest. On a phone they stack. `minmax(0, 420px)` means "at most 420px, but allowed to shrink"; without the `0`, a wide image could push past the screen edge.

---

## Step 4: See It Work

```bash
npm run dev
```

| Try this                          | Expect                                      |
| --------------------------------- | ------------------------------------------- |
| Click any card                    | Its detail page, stat bars animating up     |
| Look at the stat bars             | They grow from empty when the page opens    |
| Click **← Back to Pokedex**       | Home again                                  |
| Visit `/pokemon/pikachu` directly | Pikachu                                     |
| Visit `/pokemon/25`               | Also Pikachu — IDs work                     |
| Visit `/pokemon/notreal`          | "Pokemon not found"                         |
| Visit `/pokemon/charizard-mega-x` | Works, but says "No description available." |

That last one is worth pausing on. Mega Charizard has ID `10034`, and there is **no** `/pokemon-species/10034` — the API returns 404. Because `get()` turns that into `null` and `buildPokemon` uses `species?.` everywhere, you get the Pokemon with a fallback description instead of a crash. That exact case is covered by one of the tests.

---

## Step 5: Commit Your Progress

```bash
git add .
git commit -m "feat: add pokemon details page"
```

---

## What's Next?

You can browse and inspect. Next: finding a specific Pokemon.

Next: [07 - Feature 3: Search](./07-feature-search.md)
