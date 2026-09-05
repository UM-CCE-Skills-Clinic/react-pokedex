# 07 - Feature 3: Search

The header has no search box yet. This feature adds one, plus the results page behind it.

Same three steps: **Page → Route → Components**.

---

## What You'll See At The End

A search box in the header. Type and press Enter:

| Search    | Result                                      |
| --------- | ------------------------------------------- |
| `pikachu` | Straight to Pikachu                         |
| `25`      | Also Pikachu — IDs work                     |
| `char`    | Charmander, Charmeleon, Charizard, and more |
| `zzzz`    | "No Pokemon found"                          |
| (empty)   | Back to the home page                       |

---

## Step 1: The Page

Create `src/pages/SearchPage.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading } from '../components/ui';
import { PAGE_SIZE, get, loadMany, loadPokemon } from '../utils';

// Search results. The query comes from the address bar, e.g. "/search?q=char".
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        // The API only understands lowercase names, so tidy the query first.
        const search = query.trim().toLowerCase();

        // Try an exact match, so "25" and "Pikachu" both jump to Pikachu.
        const exactMatch = await loadPokemon(search);

        if (exactMatch !== null) {
          if (!ignore) {
            setData({ pokemon: [exactMatch], totalCount: 1 });
            setLoading(false);
          }
          return;
        }

        // Otherwise look for every name that contains what the user typed.
        const all = await get('/pokemon?limit=2000&offset=0');
        const matches = all.results.filter((entry) => entry.name.includes(search));

        // Only load details for the first 20 matches - loading hundreds of
        // Pokemon at once would be very slow.
        const pokemon = await loadMany(matches.slice(0, PAGE_SIZE));

        if (!ignore) {
          setData({ pokemon, totalCount: matches.length });
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('The search failed. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [query]);

  if (error) {
    return <ErrorMessage title="Search failed" text={error} />;
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Search results
      </p>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          &ldquo;{query}&rdquo;
        </h1>
        <Link to="/" className="text-sm font-semibold text-slate-500">
          Clear search →
        </Link>
      </div>

      {!loading && data && (
        <p className="mt-1 text-sm text-slate-500">{data.totalCount} Pokemon found</p>
      )}

      <TypeFilter selectedType="" />

      {loading && <Loading text="Searching..." />}

      {!loading && data && (
        <div>
          {data.pokemon.length === 0 ? (
            <Empty text="No Pokemon matched that name or ID. Try something else." />
          ) : (
            <PokemonGrid pokemon={data.pokemon} />
          )}
        </div>
      )}
    </div>
  );
}
```

Same shape as before. What's new is the logic inside `load`.

### The two-step search

PokeAPI has **no search endpoint**, so we build one:

```
1. Try an exact match:  /pokemon/pikachu
     found?  → show that one Pokemon, done.
     404?    → keep going.

2. Fetch all 1351 names, filter for ones containing the text.
```

Step 1 is what makes `pikachu` or `25` jump straight to the right Pokemon instead of returning a list of near-misses.

| You type  | Step 1               | Result                                 |
| --------- | -------------------- | -------------------------------------- |
| `pikachu` | found                | Pikachu                                |
| `25`      | found (IDs work too) | Pikachu                                |
| `char`    | 404                  | Charmander, Charmeleon, Charizard, ... |
| `zzzz`    | 404, then no matches | the empty message                      |

Note the `return` after the exact match — it's inside `load`, and it stops us running step 2 unnecessarily.

### `.trim().toLowerCase()`

The API only accepts lowercase, and people paste text with stray spaces. `"  Pikachu "` becomes `"pikachu"`.

### Why only 20 results

Searching `a` matches hundreds of Pokemon, and each one costs two API requests. Loading them all would take forever and hammer the API.

So we show the first 20 but report the **true** total:

```jsx
setData({ pokemon, totalCount: matches.length });
//        ↑ only 20            ↑ the real number, e.g. 340
```

The user sees "340 Pokemon found" and the first 20 cards.

### `&ldquo;` and `&rdquo;`

HTML entities for curly quotes: “char”. Straight quotes in JSX text can confuse both the linter and the reader.

---

## Step 2: The Route

Open `src/App.jsx` and add the import plus one route:

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import PokemonDetailsPage from './pages/PokemonDetailsPage';
import SearchPage from './pages/SearchPage'; // ← add this
import { ErrorMessage } from './components/ui';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
          <Route path="/search" element={<SearchPage />} /> {/* ← add this */}
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

### No placeholder this time

`/search` is a fixed address. The search text arrives as a **query string** — `/search?q=char` — which `useSearchParams` reads. Query strings aren't part of the path, so the route doesn't mention them at all.

That's the difference from Feature 2:

| Feature | Route                | Read with           |
| ------- | -------------------- | ------------------- |
| Details | `/pokemon/:nameOrId` | `useParams()`       |
| Search  | `/search`            | `useSearchParams()` |

---

## Step 3: The Component

The search box lives in the header, so we add it to the layout.

Open `src/layout/Layout.jsx` and make three changes.

**1. Update the imports at the top:**

```jsx
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
```

**2. Add the `SearchBar` function above `Header`:**

```jsx
function SearchBar() {
  const navigate = useNavigate();

  // A controlled input: `text` is the value shown in the box.
  const [text, setText] = useState('');

  function handleSubmit(event) {
    // Without this the browser would reload the whole page.
    event.preventDefault();

    if (text.trim() === '') {
      navigate('/');
    } else {
      navigate(`/search?q=${text.trim()}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ml-auto w-full max-w-md">
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search Pokemon by name or ID..."
        aria-label="Search Pokemon by name or ID"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
      />
    </form>
  );
}
```

**3. Use it inside `Header`,** just after the closing `</Link>`:

```jsx
        <Link to="/" className="flex items-center gap-2.5">
          {/* ... the logo, unchanged ... */}
        </Link>

        <SearchBar />
      </div>
    </header>
```

### Controlled inputs

This is one of the most important React patterns. Two props work together:

```jsx
value={text}                                       // React decides what's shown
onChange={(event) => setText(event.target.value)}  // typing updates React
```

The loop: you type a letter → `onChange` fires → `setText` updates state → React redraws the input with the new `value`.

It feels circular, but the point is that **React state is the single source of truth**. `text` always holds exactly what's in the box, so `handleSubmit` just reads it.

> **Left out `onChange`?** The box becomes read-only — you type and nothing appears, because `value` never changes. If that happens, this is why.

### `event.preventDefault()`

By default, submitting a form makes the browser navigate and reload the entire page — throwing away your whole React app and starting it again. `preventDefault()` stops that so we can handle it ourselves.

### Why a `<form>` at all?

We could listen for the Enter key on the input. A real `<form>` is better because you get browser behaviour for free: Enter submits, screen readers announce it as a form, and phone keyboards show a "Go" button.

### `useNavigate`

`Link` is for when the **user** clicks something. `useNavigate` is for when **your code** decides to move:

```jsx
const navigate = useNavigate();
navigate('/search?q=pikachu');
```

We can't use a `Link` here, because the destination depends on what was typed.

Note that an empty search goes home rather than to an empty results page — a small touch that makes the app feel considered.

### `aria-label`

The input has a placeholder, but placeholders vanish as soon as you type and aren't reliably announced by screen readers. `aria-label` gives it a permanent accessible name — and the Layout test finds the box using it.

---

## Step 4: See It Work

```bash
npm run dev
```

| Try this                    | Expect                                             |
| --------------------------- | -------------------------------------------------- |
| Type `pikachu`, press Enter | Pikachu, and the address reads `/search?q=pikachu` |
| Type `25`, press Enter      | Also Pikachu                                       |
| Type `char`, press Enter    | Several Charmander-family cards, with a count      |
| Type `zzzz`, press Enter    | "No Pokemon found"                                 |
| Press Enter on an empty box | Back to the home page                              |
| Click **Clear search →**    | Back to the home page                              |
| Search, then press **Back** | Where you were before                              |
| Click a result card         | Its detail page — Feature 2 still works            |

---

## Step 5: Commit Your Progress

```bash
git add .
git commit -m "feat: add pokemon search"
```

---

## What's Next?

One feature left: making those coloured type chips work.

Next: [08 - Feature 4: Filter by Type](./08-feature-filter-by-type.md)
