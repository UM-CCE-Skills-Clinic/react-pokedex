# 05 - Feature 1: Browse the Pokedex

This is the first feature, and by the end of it **the app is on screen**.

We build it in the order we'll use for every feature from here on:

> **Page → Route → Components**

---

## What You'll See At The End

A working Pokedex home page:

- a sticky header with the Pokeball logo
- a row of coloured type chips
- a grid of 20 Pokemon cards, each with its picture, number, name and types
- Previous / Next buttons that page through all Pokemon returned by PokeAPI
- a spinner while it loads

Clicking a card or a chip will say "Page not found" — those are Features 2 and 4.

> **Write all three steps before running.** The page imports components we create in Step 3, so the browser will show an import error until then. Step 4 is where you check your work.

---

## Step 1: The Page

The page decides *what* to load and *what* to show. Create `src/pages/HomePage.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading, Pagination } from '../components/ui';
import { PAGE_SIZE, get, loadMany } from '../utils';

// The home page: the full Pokedex, 20 at a time.
export default function HomePage() {
  // The page number comes from the address bar, e.g. "/?page=3".
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  // Three pieces of state: what we loaded, and how the loading is going.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set to true by the cleanup below. It stops an old, slow answer from
    // overwriting a newer one when you flip through pages quickly.
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        const offset = (page - 1) * PAGE_SIZE;

        // This list only has names, so load the details for each one.
        const list = await get(`/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
        const pokemon = await loadMany(list.results);

        if (!ignore) {
          setData({ pokemon, totalPages: Math.ceil(list.count / PAGE_SIZE) });
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('We could not load the Pokedex. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    // React runs this when `page` changes, or when you leave the page.
    return () => {
      ignore = true;
    };
  }, [page]);

  if (error) {
    return <ErrorMessage title="Could not load Pokemon" text={error} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Discover every Pokemon
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Browse the Pokedex, filter by type, or search by name and ID. Click any Pokemon to see its
        full stats.
      </p>

      <TypeFilter selectedType="" />

      {loading && <Loading />}

      {!loading && data && (
        <div>
          {data.pokemon.length === 0 ? <Empty /> : <PokemonGrid pokemon={data.pokemon} />}

          <Pagination
            page={page}
            totalPages={data.totalPages}
            makeLink={(target) => `/?page=${target}`}
          />
        </div>
      )}
    </div>
  );
}
```

That is a lot at once, so let's walk through the four ideas in it.

### Reading the page number from the address

```jsx
const [searchParams] = useSearchParams();
const page = Number(searchParams.get('page')) || 1;
```

| Address | `.get('page')` | `page` |
|---------|----------------|--------|
| `/` | `null` | `1` |
| `/?page=3` | `"3"` | `3` |
| `/?page=abc` | `"abc"` | `1` |

`.get()` always returns a **string** or `null`, so we wrap it in `Number(...)`. `Number('abc')` is `NaN`, which is falsy — so `|| 1` handles both the missing and the nonsense case.

We could have used `useState(1)` instead. Putting it in the address means the Back button works, refreshing keeps your place, and you can share the link. **If it describes what you're looking at, it belongs in the address.**

### The three pieces of state

| State | Starts as | Why |
|-------|-----------|-----|
| `data` | `null` | Nothing loaded yet. `null` clearly means "not loaded". |
| `loading` | `true` | We start loading immediately, so it's true from the first frame. |
| `error` | `null` | Nothing has gone wrong yet. |

> **Why is `loading` `true` and not `false`?** If it started `false`, the very first render would flash "No Pokemon found" before the request even began. Starting `true` shows the spinner first.

### The effect

`useEffect` runs code *after* the component appears. The array at the end is the **dependency list**:

| Dependency list | Runs |
|-----------------|------|
| `[]` | once, when the component first appears |
| `[page]` | on first appearance, and again whenever `page` changes |
| omitted | after *every* redraw — almost always a bug |

`[page]` is what makes pagination work: click Next → address becomes `/?page=2` → `page` changes → the effect runs again.

You can't write `useEffect(async () => ...)`, because React expects the effect to return a cleanup function and an async function returns a promise. So we define `load` inside and call it.

The offset maths:

| Page | Calculation | Offset | Shows |
|------|-------------|--------|-------|
| 1 | `(1-1) × 20` | 0 | 1–20 |
| 2 | `(2-1) × 20` | 20 | 21–40 |

For example, if PokeAPI reports 1351 Pokemon, `Math.ceil(1351 / 20)` is 68 — rounded **up**, because the last 11 Pokemon still need a page. The API count can change over time.

### The `ignore` flag

The function returned from `useEffect` is the **cleanup**. React runs it when you leave the page, or before running the effect again.

Click Next three times quickly and three requests are in flight — and they can come back in **any order**. A slow page-2 answer could land after page 4 and leave you looking at the wrong list.

```
You are on page 1        ignore = false   (call it flagA)
Click Next → page 2
  React runs cleanup for the old effect  →  flagA = true
  React runs the effect again            →  new flagB = false
Page 1's answer arrives late  →  checks flagA → true → ignored ✓
Page 2's answer arrives       →  checks flagB → false → used ✓
```

Each run of the effect gets its own `ignore`, and the cleanup only ever switches off its own. **You will write this in every page.**

### Choosing what to show

```jsx
if (error) {
  return <ErrorMessage ... />;   // early return: nothing else matters
}

{loading && <Loading />}
{!loading && data && ( ... )}
```

The `&&` trick: if the left side is false React draws nothing, otherwise it draws the right side. The `data &&` guard matters — on the first render `data` is `null`, and `data.pokemon` would crash.

The heading sits **outside** the loading check, so the title appears instantly while Pokemon load underneath.

---

## Step 2: The Routes

Now we tell the app which address shows this page, and wrap it in a frame.

### Create the layout

Create `src/layout/Layout.jsx`:

```jsx
import { Link, Outlet } from 'react-router-dom';

// The frame that every page is drawn inside: header, then the page, then footer.
// React Router puts the current page where <Outlet /> is.

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 ring-2 ring-white">
            <span className="h-3 w-3 rounded-full bg-white ring-[3px] ring-slate-900" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Poke<span className="text-brand-600">dex</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>Built with React, React Router and Tailwind CSS.</p>
        <p>
          Data from{' '}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600"
          >
            PokeAPI
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
```

> We'll add the search box to this header in Feature 3.

**`<Outlet />`** is the placeholder React Router fills with the current page. Because `Layout` never unmounts, the header genuinely stays put when you navigate — it doesn't flicker.

**`<header>`, `<main>`, `<footer>`** are real semantic tags, not `<div>`s. Screen readers let users jump straight to `<main>`, and the tests find the header and footer by their roles.

**`{' '}`** in the footer is a deliberate space. JSX strips whitespace at line ends, so without it you'd get "Data fromPokeAPI".

**A plain `<a>`, not a `Link`** — PokeAPI is an external site, so we really do want to leave.

### Create the route table

Open `src/App.jsx` and **replace everything** with:

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import { ErrorMessage } from './components/ui';

// This is the list of pages in the app, and the address each one lives at.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />

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

### The three router pieces

**`BrowserRouter`** watches the address bar. It's why `Link`, `useParams` and `useSearchParams` work anywhere inside it.

**`Routes`** renders the **best match**, not the first match — so ordering doesn't trip you up.

**`Route`** maps one address to one page. Note `element` takes real JSX: `<HomePage />`, not `HomePage`.

### The nested route

```jsx
<Route element={<Layout />}>
  <Route path="/" element={<HomePage />} />
</Route>
```

The outer `Route` has **no `path`** — it exists only to wrap the others. It's called a *layout route*, and every page inside it gets drawn at `<Outlet />`:

```
<Layout>
  <Header />        ← always
  <main>
    <HomePage />    ← swapped in at <Outlet />
  </main>
  <Footer />        ← always
</Layout>
```

Without it, you'd write `<Layout>` inside all five pages.

### The catch-all

`path="*"` matches anything not listed above. Adding it now means the links we haven't built yet show a proper "Page not found" — inside the layout, with a way back — instead of a blank screen.

> **JSX comments** are wrapped in braces: `{/* like this */}`. A bare `// comment` would render as text.

### Check the entry point

Open `src/main.jsx`. The Vite starter already got it right, so you probably don't need to change anything:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`createRoot(...)` finds the empty `<div id="root">` from `index.html` and gives React control of it. `import './index.css'` is how Vite knows your stylesheet is part of the app.

**`<StrictMode>`** is a development-only helper that deliberately runs your effects **twice** on mount to expose bugs. It's exactly the check that catches a missing cleanup function — your `ignore` flags already handle it.

---

## Step 3: The Components

Two files: the small shared pieces, and the grid.

### Create the shared UI pieces

Create `src/components/ui.jsx`:

```jsx
import { Link } from 'react-router-dom';

// Small pieces that several pages share.

// Shown while a page is loading.
export function Loading({ text = 'Loading Pokemon...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      <p className="text-sm font-semibold text-slate-500">{text}</p>
    </div>
  );
}

// Shown when a search or a filter has no results.
export function Empty({ text = "We couldn't find any Pokemon matching that." }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl">
        🔍
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-800">No Pokemon found</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      <Link
        to="/"
        className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to all Pokemon
      </Link>
    </div>
  );
}

// Shown when something went wrong, and on unknown pages.
export function ErrorMessage({ title = 'Something went wrong', text }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{text}</p>
      <Link
        to="/"
        className="mt-7 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Back to Pokedex
      </Link>
    </div>
  );
}

// Previous / next buttons. The page number lives in the address bar, so the
// browser's back button and shared links keep working.
export function Pagination({ page, totalPages, makeLink }) {
  if (totalPages <= 1) {
    return null;
  }

  const buttonStyle =
    'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100';
  const disabledStyle =
    'rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-slate-200';

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link to={makeLink(page - 1)} className={buttonStyle}>
          ← Previous
        </Link>
      ) : (
        <span className={disabledStyle}>← Previous</span>
      )}

      <span className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">
        {page} <span className="font-normal text-slate-400">/ {totalPages}</span>
      </span>

      {page < totalPages ? (
        <Link to={makeLink(page + 1)} className={buttonStyle}>
          Next →
        </Link>
      ) : (
        <span className={disabledStyle}>Next →</span>
      )}
    </div>
  );
}
```

### What's new here

**Components are functions that return markup.** The name must start with a capital letter — `<Loading />` is your component, `<loading />` would be an HTML tag.

**Props are the values passed in**, destructured in the parameter list, and can have defaults:

```jsx
function Loading({ text = 'Loading Pokemon...' }) { ... }

<Loading />                      // uses the default
<Loading text="Searching..." />  // overrides it
```

**`Link` instead of `<a>`.** A normal `<a href="/">` throws the whole app away and downloads the page again. `Link` swaps it instantly. Use `Link` inside your app, `<a>` for external sites.

**Returning `null`** means "draw nothing" — no point showing pager buttons for a single page.

**The ternary for disabled buttons.** You can't put an `if` inside JSX, so `condition ? a : b`:

```jsx
{page > 1 ? <Link ...>← Previous</Link> : <span ...>← Previous</span>}
```

On page 1 "Previous" becomes a `<span>` — it *looks* disabled and genuinely isn't clickable, because a span has no address.

**The `makeLink` prop is a function.** Different pages need different addresses:

| Page | Passes |
|------|--------|
| Home | ``makeLink={(target) => `/?page=${target}`}`` |
| Type | ``makeLink={(target) => `/type/${type}?page=${target}`}`` |

Passing functions as props is an everyday React pattern.

### Create the grid

Create `src/components/PokemonGrid.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatName, formatNumber, get, getTypeColor } from '../utils';

// A coloured pill showing one type, for example "fire".
export function TypeBadge({ type }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: getTypeColor(type) }}
    >
      {type}
    </span>
  );
}

// The row of type filters above the grid.
// It loads its own list, so the pages using it do not have to.
export function TypeFilter({ selectedType }) {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const data = await get('/type');

      // These exist in the API but have no Pokemon, so they make bad filters.
      const notRealTypes = ['unknown', 'shadow', 'stellar'];

      if (!ignore) {
        setTypes(
          data.results
            .filter((type) => !notRealTypes.includes(type.name))
            .map((type) => ({ name: type.name, displayName: formatName(type.name) }))
        );
      }
    }

    // The filters are a nice extra, so if they fail we just show none.
    load().catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
      <Link
        to="/"
        className={
          selectedType
            ? 'shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200'
            : 'shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
        }
      >
        All
      </Link>

      {types.map((type) => (
        <Link
          key={type.name}
          to={`/type/${type.name}`}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: getTypeColor(type.name) }}
        >
          {type.displayName}
        </Link>
      ))}
    </nav>
  );
}

// One clickable Pokemon card.
function PokemonCard({ pokemon }) {
  // Cards are tinted with the colour of the Pokemon's first type.
  const color = getTypeColor(pokemon.types[0]);

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className="relative flex h-40 items-center justify-center"
        style={{ backgroundColor: `${color}22` }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-slate-500">
          #{formatNumber(pokemon.id)}
        </span>
        <img
          src={pokemon.image}
          alt={pokemon.displayName}
          loading="lazy"
          className="h-32 w-32 object-contain"
        />
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <h3 className="font-bold text-slate-900">{pokemon.displayName}</h3>
        <div className="flex flex-wrap gap-1.5">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </Link>
  );
}

// The grid of cards. `key` tells React which card is which when the list changes.
export default function PokemonGrid({ pokemon }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pokemon.map((item) => (
        <PokemonCard key={item.id} pokemon={item} />
      ))}
    </div>
  );
}
```

### What's new here

**Inline styles need double braces.** The outer `{ }` is JSX saying "JavaScript follows"; the inner `{ }` is a plain object. Note `backgroundColor`, not `background-color`:

```jsx
style={{ backgroundColor: getTypeColor(type) }}
```

Why not Tailwind? Tailwind scans your files for complete class names, so a colour computed at runtime would never be found. **Colours that come from data must be inline styles.**

**`${color}22`** makes an 8-digit hex like `#ff9c5422`, where the last two digits are transparency — about 13%, giving a soft tint.

**Rendering lists with `.map()`**, and **`key` is required**. React uses it to tell items apart when the list changes. Use something unique and stable — a name or id, never the array index.

**`TypeFilter` loads its own data.** It's the one component that does, because every page shows the same chips — this way no page has to fetch them. `[]` as the dependency list means "run once". The empty `.catch(() => {})` is deliberate: the filters are a bonus, so if they fail you just see the "All" chip and the page still works.

**The whole card is a `Link`.** Making the outermost element the link means the entire card is clickable, not just the name — a much bigger target on a phone.

**`export default` vs `export`:**

```jsx
// default → no braces, you can name it anything
// named   → braces, name must match
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
```

The main thing a file provides is the default export; extras are named. `PokemonCard` has no `export` at all — only this file uses it.

**The responsive grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` — 2 columns on a phone, up to 5 on a wide screen.

---

## Step 4: See It Work

```bash
npm run dev
```

Open `http://localhost:5173`. **The Pokedex should load.**

| Try this | Expect |
|----------|--------|
| Load the page | Spinner, then a grid of 20 Pokemon |
| Look at the top | Sticky header with the Pokeball logo |
| Look above the grid | Coloured type chips, with "All" highlighted |
| Click **Next** | Page 2, address becomes `/?page=2` |
| Press **Back** | Page 1 again |
| Resize narrow (F12, `Ctrl+Shift+M`) | Grid drops to 2 columns |
| Visit `/nonsense` | "Page not found", still inside the layout |
| Click a card or a chip | "Page not found" — that's Features 2 and 4 |

> **Blank page?** Open the console (F12). A red error names the file and line — usually a wrong import path or a missing `export default`.
>
> **Cards but no styling?** Check `src/index.css` starts with `@import 'tailwindcss';` and that `main.jsx` imports it.
>
> **Nothing loads, network errors?** You need internet for PokeAPI. Open `https://pokeapi.co/api/v2/pokemon/pikachu` in a tab to check.

---

## Step 5: Commit Your Progress

```bash
git add .
git commit -m "feat: add pokedex home page with grid and pagination"
```

---

## What's Next?

The grid works, but clicking a card goes nowhere. Let's fix that.

Next: [06 - Feature 2: Pokemon Details](./06-feature-pokemon-details.md)
