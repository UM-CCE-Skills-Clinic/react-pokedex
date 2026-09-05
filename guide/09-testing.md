# 09 - Testing

All four features are built and working. Now we run the test suite that has been sitting in `tests/` since Part 01 — for the first time.

> **Why now, and not earlier?** The tests import your pages, your components and your `App`. Run them before those files exist and every single one fails with "Failed to resolve import", which tells you nothing useful. Now that the app is complete, one run checks all of it at once.

## Step 0: Run Them

```bash
npm run test:run
```

You should see:

```
 ✓ tests/utils.test.js (17 tests)
 ✓ tests/components/ui.test.jsx (9 tests)
 ✓ tests/components/PokemonGrid.test.jsx (10 tests)
 ✓ tests/components/PokemonDetail.test.jsx (7 tests)
 ✓ tests/layout/Layout.test.jsx (4 tests)
 ✓ tests/pages/HomePage.test.jsx (6 tests)
 ✓ tests/pages/PokemonDetailsPage.test.jsx (5 tests)
 ✓ tests/pages/SearchPage.test.jsx (4 tests)
 ✓ tests/pages/TypePage.test.jsx (6 tests)
 ✓ tests/App.test.jsx (4 tests)

 Test Files  10 passed (10)
      Tests  73 passed (73)
```

**73 tests passing.** If something is red, skip to [Step 8](#step-8-if-something-fails) — then come back and read the rest, because understanding these tests is what lets you write your own later.

---

## The Tools

| Tool | Job |
|------|-----|
| **Vitest** | Runs the tests. Built into Vite, so it understands JSX with no extra setup. |
| **React Testing Library** | Renders your components and finds things on screen. |
| **jsdom** | A fake browser. Node has no DOM, so this provides one. |
| **`@testing-library/jest-dom`** | Extra checks like `toBeInTheDocument()`. |
| **`user-event`** | Simulates real typing and clicking. |

---

## Step 1: Understand the Configuration

Open `vite.config.js` and look at the `test` block:

```javascript
test: {
  // All test files live in the tests/ folder, next to src/.
  include: ['tests/**/*.test.{js,jsx}'],

  // Needed so Testing Library clears the page between tests.
  // Without this, each test would still see the last test's HTML.
  globals: true,

  // Tests need a fake browser, because our components render HTML.
  environment: 'jsdom',

  // Runs before every test file. Adds the extra expect(...) checks.
  setupFiles: './tests/setup.js',

  coverage: {
    reporter: ['text', 'lcov', 'html'],
    include: ['src/**/*.{js,jsx}'],
    // main.jsx just starts the app, so there is nothing to test in it.
    exclude: ['src/main.jsx']
  }
}
```

### `globals: true` is not optional here

This one deserves a warning, because getting it wrong produces a very confusing failure.

Testing Library automatically empties the page between tests — but it does that by registering a global `afterEach` hook, which only exists when `globals` is on.

Turn it off and every test still sees the previous test's HTML. You get a pile of errors like:

```
TestingLibraryElementError: Found multiple elements with the text: Pikachu
```

It looks like your component is rendering twice. It isn't — that's four tests' worth of leftovers stacked on the page.

### `tests/setup.js`

```javascript
// Runs before every test file.
// This adds the friendly checks like expect(...).toBeInTheDocument().
import '@testing-library/jest-dom/vitest';
```

That single import gives you readable checks like `toBeInTheDocument()` and `toHaveAttribute()`.

---

## Step 2: Understand How the Tests Avoid the Network

**No test in this suite ever calls PokeAPI.** Real requests would make tests slow, flaky and dependent on your internet connection — and you couldn't test a 404 on demand.

Instead we replace `axios.get` with a fake:

```javascript
vi.spyOn(axios, 'get').mockResolvedValue({ data: pikachuResponse });
```

| Piece | Meaning |
|-------|---------|
| `vi.spyOn(axios, 'get')` | take over the real `axios.get` |
| `.mockResolvedValue(x)` | whenever it's called, succeed with `x` |
| `.mockRejectedValue(e)` | whenever it's called, fail with `e` |

Faking a 404 becomes trivial:

```javascript
const notFoundError = { response: { status: 404 } };
vi.spyOn(axios, 'get').mockRejectedValue(notFoundError);
```

And afterwards we always put the real one back:

```javascript
afterEach(() => {
  vi.restoreAllMocks();
});
```

Forget that, and one test's fake leaks into the next.

### Answering based on the address

`loadMany` starts many requests at once, so you can't rely on their order. Several tests use a fake that looks at the address instead:

```javascript
vi.spyOn(axios, 'get').mockImplementation((url) => {
  if (url.includes('/type')) {
    return Promise.resolve({ data: { results: [{ name: 'grass' }] } });
  }
  if (url.includes('/pokemon-species/')) {
    return Promise.resolve({ data: speciesResponse });
  }
  return Promise.resolve({ data: pokemonResponse });
});
```

---

## Step 3: Understand How Tests Find Things

Testing Library looks for what a **person** would look for — a heading, a link, a label — not CSS classes:

```javascript
screen.getByText('Pikachu');
screen.getByRole('link', { name: 'Back to Pokedex' });
screen.getByAltText('Pikachu');
```

That's why restyling your components doesn't break the tests. Had they searched for `.pokemon-card__title`, every class rename would break them.

### The three prefixes

| Prefix | If not found | Use for |
|--------|--------------|---------|
| `getBy...` | throws immediately | something that should be there right now |
| `queryBy...` | returns `null` | checking something is **absent** |
| `findBy...` | waits, then throws | something that appears **after** loading |

`findBy` is what makes async tests work:

```javascript
// The spinner is there immediately
expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();

// Bulbasaur only appears once the fake request resolves - so we wait
expect(await screen.findByText('Bulbasaur')).toBeInTheDocument();
```

And `queryBy` is the only one that can prove a thing is missing:

```javascript
expect(screen.queryByRole('link', { name: '← Previous' })).not.toBeInTheDocument();
```

### Components that need a router

Anything using `Link` or `useParams` must be rendered inside a router, or it throws. Tests use `MemoryRouter`, which keeps its address in memory instead of the address bar:

```javascript
render(
  <MemoryRouter initialEntries={['/pokemon/pikachu']}>
    <Routes>
      <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
    </Routes>
  </MemoryRouter>
);
```

`initialEntries` is how a test pretends you navigated to a particular address — that's how `useParams` gets `pikachu`.

---

## Step 4: Read One Test All the Way Through

From `tests/pages/HomePage.test.jsx`:

```javascript
it('shows a loading message first, then the Pokemon', async () => {
  mockApi();
  renderHome();

  expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();

  // findBy waits for the request to finish.
  expect(await screen.findByText('Bulbasaur')).toBeInTheDocument();
  expect(screen.queryByText('Loading Pokemon...')).not.toBeInTheDocument();
});
```

Line by line:

1. `mockApi()` — set up fake answers
2. `renderHome()` — draw the page inside a `MemoryRouter`
3. `getByText` — the spinner is there **right now** (because `loading` starts `true`)
4. `await findByText` — wait for the fake request, then check Bulbasaur appeared
5. `queryByText ... not` — and the spinner is **gone**

That single test verifies the entire loading flow you wrote in Feature 1.

---

## Step 5: Run the Tests the Three Ways

### Watch mode — while you work

```bash
npm test
```

Stays running and re-runs affected tests every time you save. Press `q` to quit.

### Once — for a quick check

```bash
npm run test:run
```

### With coverage — what's tested and what isn't

```bash
npm run test:ci
```

```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |     100 |    89.09 |     100 |     100 |
```

| Column | Meaning |
|--------|---------|
| `% Stmts` | lines of code that ran |
| `% Branch` | `if`/`else` paths that were taken |
| `% Funcs` | functions that were called |

You should see **100% statements, functions and lines**, and about **89% branches**.

> **Why not 100% branches?** The uncovered ones are the `if (!ignore)` guards. Hitting those means leaving a page mid-request, which is fiddly to simulate and not worth a brittle timing test. High coverage is a useful signal, not a target to chase.

---

## Step 6: Run the Quality Checks

### Linting — finds mistakes

```bash
npm run lint
```

ESLint catches unused variables, missing `key` props, and hook rules. Many issues fix themselves:

```bash
npm run lint:fix
```

### Formatting — keeps style consistent

```bash
npm run format:check
```

If it complains, fix it automatically:

```bash
npm run format
```

Prettier decides indentation, quotes and line breaks so nobody has to argue about them. The rules live in `.prettierrc`.

### Build — proves it compiles

```bash
npm run build
```

This produces the real production files in `dist/`. It catches problems the dev server tolerates, like an import that doesn't resolve.

---

## Step 7: Run Everything Together

One command runs all four gates in order:

```bash
npm run ci
```

That is:

```
format:check  →  lint  →  test:ci  →  build
```

All four must pass. This is the same sequence GitHub Actions runs on your Pull Request, so if it passes here it should pass there.

---

## Step 8: If Something Fails

| Failing | Where to look | Built in |
|---------|---------------|----------|
| `tests/utils.test.js` | `src/utils.js` | Part 04 |
| `tests/components/ui.test.jsx` | `src/components/ui.jsx` | Feature 1 |
| `tests/components/PokemonGrid.test.jsx` | `src/components/PokemonGrid.jsx` | Feature 1 |
| `tests/pages/HomePage.test.jsx` | `src/pages/HomePage.jsx` | Feature 1 |
| `tests/components/PokemonDetail.test.jsx` | `src/components/PokemonDetail.jsx` | Feature 2 |
| `tests/pages/PokemonDetailsPage.test.jsx` | `src/pages/PokemonDetailsPage.jsx` | Feature 2 |
| `tests/layout/Layout.test.jsx` | `src/layout/Layout.jsx` | Feature 3 |
| `tests/pages/SearchPage.test.jsx` | `src/pages/SearchPage.jsx` | Feature 3 |
| `tests/pages/TypePage.test.jsx` | `src/pages/TypePage.jsx` | Feature 4 |
| `tests/App.test.jsx` | `src/App.jsx` — usually an import path | Features 1–4 |

Common causes:

1. **File names** — `PokemonGrid.jsx`, not `pokemongrid.jsx`. Capitalisation counts.
2. **Missing exports** — did you `export` every function the tests import?
3. **`export default` vs `export`** — `PokemonGrid` is default; `TypeFilter` and `TypeBadge` are named.
4. **Typos in text** — tests search for exact wording like `'No Pokemon found'`.

### Specific failures and what they mean

| Failing test | Likely cause |
|--------------|--------------|
| "shows a loading message first" | `useState(false)` for loading — it must start `true` |
| "asks the API for the page in the address bar" | Offset maths. Page 3 is `(3-1) × 20 = 40` |
| `Found multiple elements` in a grid test | A missing `key` on one of the `.map()` calls |
| `Found multiple elements with the text: Hidden` | The `&&` is outside the `.map()`, so every ability gets the badge |
| "says not found when there is no such Pokemon" | Early-return order — `loading` must be checked before `pokemon === null` |
| "says not found when the type does not exist" | Missing the `!loading &&` guard on the not-found return |
| "splits the list into pages of 20" | Slicing `members` *after* `loadMany` instead of before |
| "goes to the search page when you search" | Missing `event.preventDefault()`, or the input lacks `value`/`onChange` |
| "falls back to matching part of a name" | The `return` after the exact match must be *inside* the `if` |
| Anything in `App.test.jsx` | Almost always an import path or capitalisation |

Fix, re-run, repeat until green. **Never edit a test to make it pass** — the test describes what the app should do.

---

## Step 9: Commit Your Progress

```bash
git add .
git commit -m "test: verify all tests and quality checks pass"
```

---

## What's Next?

Everything is verified. Time to use the app properly and ship it.

Next: [10 - Running the App](./10-running-and-pull-request.md)
