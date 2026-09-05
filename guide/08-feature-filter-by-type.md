# 08 - Feature 4: Filter by Type

The coloured chips have been sitting above the grid since Feature 1, but clicking one says "Page not found". This is the last feature — let's make them work.

Same three steps: **Page → Route → Components**.

---

## What You'll See At The End

Click a type chip and get every Pokemon of that type, paginated. The chip you're on stays highlighted, and "All" takes you back.

An address like `/type/banana` gives a friendly "Type not found".

---

## Step 1: The Page

Create `src/pages/TypePage.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading, Pagination } from '../components/ui';
import { PAGE_SIZE, get, loadMany } from '../utils';

// Every Pokemon of one type, e.g. "/type/water?page=2".
export default function TypePage() {
  // `type` comes from the route "/type/:type".
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        const result = await get(`/type/${type}`);

        // The API gives us null when there is no type with this name.
        if (result === null) {
          if (!ignore) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        // The API nests each entry, so pull out the actual Pokemon. We get all
        // of them at once, so slice out just the page we want to show.
        const members = result.pokemon.map((entry) => entry.pokemon);
        const offset = (page - 1) * PAGE_SIZE;
        const pokemon = await loadMany(members.slice(offset, offset + PAGE_SIZE));

        if (!ignore) {
          setData({
            pokemon,
            totalCount: members.length,
            totalPages: Math.ceil(members.length / PAGE_SIZE)
          });
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('We could not load this type. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [type, page]);

  if (error) {
    return <ErrorMessage title="Could not load this type" text={error} />;
  }

  if (!loading && data === null) {
    return (
      <ErrorMessage title="Type not found" text={`There is no Pokemon type called "${type}".`} />
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Filtered by type
      </p>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold capitalize tracking-tight text-slate-900 sm:text-3xl">
          {type} Pokemon
        </h1>
        <Link to="/" className="text-sm font-semibold text-slate-500">
          Show all →
        </Link>
      </div>

      {!loading && data && (
        <p className="mt-1 text-sm text-slate-500">{data.totalCount} Pokemon of this type</p>
      )}

      <TypeFilter selectedType={type} />

      {loading && <Loading />}

      {!loading && data && (
        <div>
          {data.pokemon.length === 0 ? <Empty /> : <PokemonGrid pokemon={data.pokemon} />}

          <Pagination
            page={page}
            totalPages={data.totalPages}
            makeLink={(target) => `/type/${type}?page=${target}`}
          />
        </div>
      )}
    </div>
  );
}
```

This page combines everything so far: a path placeholder *and* a query string, pagination, and a not-found case.

### Two dependencies

```jsx
}, [type, page]);
```

The effect must re-run when **either** changes — clicking a different chip, or clicking Next. **List every value the effect uses from outside.**

### Paginating on the client

The home page asked the API for one page at a time. Here we can't: `/type/ghost` returns the whole current list of ghost Pokemon in one response, with no paging option.

So we slice it ourselves:

```jsx
const members = result.pokemon.map((entry) => entry.pokemon);
const offset = (page - 1) * PAGE_SIZE;
const pokemon = await loadMany(members.slice(offset, offset + PAGE_SIZE));
```

The `.map()` is needed because the API wraps each entry as `{ slot: 1, pokemon: { name, url } }` — we only want the inner object.

Then `.slice()` picks the 20 for this page. Crucially we call `loadMany` on **those 20 only**, not the whole list — loading details for every ghost Pokemon just to show 20 would be slow and wasteful.

### The early `return` inside `load`

```jsx
if (result === null) {
  if (!ignore) {
    setData(null);
    setLoading(false);
  }
  return;
}
```

If the type doesn't exist there's nothing more to do. Note this returns from `load`, not from the component.

### `!loading &&` on the not-found check

```jsx
if (!loading && data === null) {
```

`data` starts as `null`, so without the `!loading` guard this page would flash "Type not found" for a moment on **every** visit before the data arrived. Same lesson as the details page: check `loading` first.

### `capitalize`

The address gives us `"water"` in lowercase. Rather than transform the string in JavaScript, the Tailwind class `capitalize` handles it in CSS.

### A different `makeLink`

```jsx
makeLink={(target) => `/type/${type}?page=${target}`}
```

Compare with the home page's `` `/?page=${target}` ``. Same `Pagination` component, different addresses — which is exactly why it takes a function instead of building the address itself.

---

## Step 2: The Route

Open `src/App.jsx` and add the last import and route. This is the **finished** route table, so here it is complete — replace your whole file with it:

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import PokemonDetailsPage from './pages/PokemonDetailsPage';
import SearchPage from './pages/SearchPage';
import TypePage from './pages/TypePage';
import { ErrorMessage } from './components/ui';

// This is the list of pages in the app, and the address each one lives at.
// ":type" and ":nameOrId" are placeholders - the page reads them with useParams.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/type/:type" element={<TypePage />} />

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

Two lines are new: the `TypePage` import, and the `/type/:type` route.

> Copying the whole file also clears out the `// ← add this` markers from the previous two features, so you finish with a clean file.

**Your route table is now complete.** Five routes:

| Address | Page | Reads the address with |
|---------|------|------------------------|
| `/` | HomePage | `useSearchParams` (`?page=`) |
| `/pokemon/:nameOrId` | PokemonDetailsPage | `useParams` |
| `/search` | SearchPage | `useSearchParams` (`?q=`) |
| `/type/:type` | TypePage | both |
| `*` | "Page not found" | — |

---

## Step 3: The Component

No new component this time — `TypeFilter` has been in `src/components/PokemonGrid.jsx` since Feature 1, and its links have always pointed at `/type/...`. They just had nowhere to go until now.

But there's one prop we skipped over, and now it matters.

### `selectedType` highlights the active chip

Look back at the top of `TypeFilter`:

```jsx
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
```

The "All" chip styles itself from `selectedType`:

| Page | Passes | "All" chip looks |
|------|--------|------------------|
| Home | `selectedType=""` | dark — you're viewing everything |
| Search | `selectedType=""` | dark |
| Type | `selectedType={type}` | plain white — it's a way *back* |

An empty string is falsy, so `selectedType ? ... : ...` picks the dark style when nothing is filtered.

### Choosing a class name with a ternary

```jsx
className={condition ? 'these classes' : 'those classes'}
```

`className` is just a string, so you can compute it like any other value. This is how components change appearance based on props.

> **Why does `TypeFilter` load its own data?** It's the one component in this app that does. Every page shows the same chips, so having the component fetch them means no page has to think about it. That's the exception, not the rule — components normally receive data through props.

---

## Step 4: See It Work

```bash
npm run dev
```

| Try this | Expect |
|----------|--------|
| Click the **Water** chip | Only water Pokemon, address `/type/water` |
| Look at the chips | "All" is now plain white, not dark |
| Look under the heading | A count such as "142 Pokemon of this type" |
| Click **Next** | Page 2, address `/type/water?page=2` |
| Click a different chip | That type, back on page 1 |
| Click **All** or **Show all →** | Home |
| Click a card | Its detail page |
| Visit `/type/banana` | "Type not found" |

**Every feature now works.** Browse, details, search and filtering — plus pagination and friendly errors throughout.

---

## Step 5: Commit Your Progress

```bash
git add .
git commit -m "feat: add filter by type"
```

---

## What's Next?

The app is feature-complete. Now it's time to run the test suite that has been waiting in `tests/` since Part 01, and verify everything at once.

Next: [09 - Testing](./09-testing.md)
