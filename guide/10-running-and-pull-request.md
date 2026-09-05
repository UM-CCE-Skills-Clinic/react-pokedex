# 10 - Running the App and Creating a Pull Request

Congratulations! You've built a complete React Pokedex — four features, each one working before you moved to the next. Let's use it properly and then ship it.

---

## Step 1: Start the Development Server

```bash
npm run dev
```

You should see:

```
  VITE v8.2.2  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173`.

> The dev server has **hot reload** — save any file and the browser updates instantly, usually without losing your place.

---

## Step 2: Explore the Four Features

### Feature 1 — Browse the Pokedex

The home page shows the first 20 Pokemon. Use **Previous / Next** to page through the pages reported by PokeAPI.

Watch the address change to `/?page=2`, then press the browser's **Back** button — you return to page 1. That works because the page number lives in the address, not in component state.

### Feature 2 — Pokemon Details

Click any card. You get the description, category, height and weight, capture rate, happiness, abilities (with a **Hidden** badge where it applies), and base stat bars that animate up from empty.

Try `http://localhost:5173/pokemon/charizard-mega-x`. It has no species entry of its own, so it shows "No description available." instead of crashing — the fallback you built in Part 04.

### Feature 3 — Search

Type in the header search box and press Enter:

| Search | What happens |
|--------|--------------|
| `pikachu` | Jumps straight to Pikachu (exact match) |
| `25` | Also Pikachu — IDs work too |
| `char` | Charmander, Charmeleon, Charizard, and more |
| `zzzz` | "No Pokemon found" |
| (empty) | Sends you back to the home page |

### Feature 4 — Filter by Type

Click any coloured chip, e.g. `/type/water`. Type pages are paginated too. Click **All** to clear the filter.

### Error Pages

| Try | Expect |
|-----|--------|
| `/pokemon/notreal` | "Pokemon not found" |
| `/type/banana` | "Type not found" |
| `/some/random/address` | "Page not found" |

All three keep the header and footer, with a link back.

### Check It Works on a Phone

Press **F12**, then the device-toolbar button (or `Ctrl+Shift+M`). At phone width the grid drops to 2 columns and the footer stacks. That's the `sm:` / `lg:` / `xl:` prefixes doing their job.

---

## Step 3: Try the Production Build

The dev server is optimised for editing. Let's see what actually ships:

```bash
npm run build
```

The asset names and sizes vary with source changes and dependency versions. A successful build should contain `dist/index.html`, at least one JavaScript file in `dist/assets/`, and at least one CSS file in `dist/assets/`.

Then preview those exact files:

```bash
npm run preview
```

Open the address it prints (usually `http://localhost:4173`).

> **Only ~22 kB of CSS?** Tailwind ships only the classes you actually used, not the whole framework.
>
> **The `dist/` folder is not committed.** It's in `.gitignore` — build output is regenerated, never stored in Git.

---

## Step 4: Run the Final Checks

1. Stop the dev server (`Ctrl+C`).

2. Run all four gates:

```bash
npm run ci
```

3. Everything should pass:

```
format:check  ✓
lint          ✓
Test Files    10 passed (10)
Tests         73 passed (73)
built in 205ms
```

> When you open your Pull Request, GitHub Actions runs the **Project Submission Pipeline**. It first checks your PR description for the required student info, then runs these same gates. Running `npm run ci` locally first means no surprises.

---

## Step 5: Commit Your Work

```bash
git add .
git commit -m "docs: finalize react pokedex application"
```

Your personal details do **not** go in the commit — they go in the Pull Request description (Step 7).

---

## Step 6: Push Your Branch

```bash
git push -u origin your-lastname/pokedex-pull-request
```

Replace the branch name with your actual one, e.g.:

```bash
git push -u origin dela-cruz/pokedex-pull-request
```

> **Not sure of your branch name?** Run `git branch` — yours is the one with the `*`.

---

## Step 7: Create a Pull Request

1. Go to the original repository on GitHub.

2. Click **Pull Requests** → **New Pull Request** → **compare across forks**.

3. Select:
   - Base repository: the original repo, base branch: `main`
   - Head repository: your fork, compare branch: your branch

4. The repository ships a **Pull Request template**, so the description box is already filled in for you. You only need to set the title and complete the **Student Information** section.

**Student Information** — replace each value with your own. Keep the labels **exactly** as shown (the pipeline reads them character-for-character), and use your real `@umindanao.edu.ph` address:

```
First Name: Juan
Last Name: Dela Cruz
Program: BS Computer Science
UMindanao Email: j.delacruz.123456@umindanao.edu.ph
```

**Title** — the pipeline builds the expected title as `<Last Name>/pokedex-pull-request`, using your **Last Name field exactly as you typed it above**. So for the example above, the title must be:

```
Dela Cruz/pokedex-pull-request
```

> ⚠️ **The title is not the same as your branch name.** Your branch is lowercase and hyphenated (`dela-cruz/pokedex-pull-request`), but the title must match your Last Name field character-for-character — capitals, spaces and all. `Dela Cruz` in the field means `Dela Cruz/pokedex-pull-request` in the title. A mismatch fails the **Extract Student Info** job.

> ⚠️ **All four fields are required.** If any is missing — or the email isn't a `@umindanao.edu.ph` address — the **PR Info Check** fails and the rest of the pipeline won't run. Note the exact spelling: `First Name`, `Last Name`, `Program`, and `UMindanao Email` (capital `U` and `M`).
>
> ⚠️ **Every commit must be authored by you.** The pipeline compares each commit's GitHub account against whoever opened the PR. If your commits show a different author, check your local Git identity:
>
> ```bash
> git config user.name
> git config user.email
> ```
>
> The email must be one attached to your GitHub account.

5. Click **Create Pull Request**.

6. Watch the **Checks** tab. If something fails, read the log, fix it locally, then commit and push again — the PR updates automatically.

---

## Final Project Structure

Your completed project should look like this:

```
react-pokedex/
├── guide/                          # This tutorial
├── public/
├── src/
│   ├── main.jsx                    # Starts the app          (Feature 1)
│   ├── App.jsx                     # Route table             (Features 1-4)
│   ├── index.css                   # Tailwind theme          (Part 03)
│   ├── utils.js                    # Shared helpers          (Part 04)
│   ├── layout/
│   │   └── Layout.jsx              # Header, search, footer  (Features 1, 3)
│   ├── components/
│   │   ├── ui.jsx                  # Loading, empty, error, pager  (Feature 1)
│   │   ├── PokemonGrid.jsx         # Cards, badges, filters  (Feature 1)
│   │   └── PokemonDetail.jsx       # The big detail card     (Feature 2)
│   └── pages/
│       ├── HomePage.jsx            #                         (Feature 1)
│       ├── PokemonDetailsPage.jsx  #                         (Feature 2)
│       ├── SearchPage.jsx          #                         (Feature 3)
│       └── TypePage.jsx            #                         (Feature 4)
├── tests/                          # Provided for you
│   ├── setup.js
│   ├── utils.test.js
│   ├── App.test.jsx
│   ├── layout/
│   ├── components/
│   └── pages/
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## What You've Learned

**React fundamentals**

- Components, props, and JSX
- `useState` for data a component remembers
- `useEffect` for loading data, with dependency arrays and cleanup
- Conditional rendering with `&&`, ternaries and early returns
- Rendering lists with `.map()` and why `key` matters

**Application patterns**

- Building one feature at a time: **Page → Route → Components**
- Loading with three states: loading, error, and data
- Telling "not found" apart from "went wrong"
- Discarding stale responses with the `ignore` flag
- Keeping page state in the address bar so the browser works properly
- Passing functions as props (`makeLink`)

**Tooling**

- Vite for development and production builds
- React Router: nested layouts, path placeholders, catch-all routes
- Tailwind v4 configured in CSS with `@theme`
- Vitest and React Testing Library, including mocking `axios`
- ESLint, Prettier, and a CI pipeline
- Git workflow with conventional commits

---

## Troubleshooting

### "Cannot find module" or "Failed to resolve import"

```bash
npm install
```

If it persists, check the import path and capitalisation — `./components/PokemonGrid` is not the same as `./Components/pokemongrid`.

### Port 5173 is already in use

Another dev server is still running. Stop it with `Ctrl+C`, or let Vite pick the next free port when it offers.

### The page is blank

Open the browser console (F12). The red error names the file and line. Most often a missing `export default`.

### The page loads but has no styling

1. Check `src/index.css` starts with `@import 'tailwindcss';`
2. Check `src/main.jsx` has `import './index.css';`
3. Check `vite.config.js` includes `tailwindcss()` in `plugins`
4. Restart the dev server

### Nothing loads and the console shows network errors

The app needs internet access to reach PokeAPI. Check you're online, and open `https://pokeapi.co/api/v2/pokemon/pikachu` in a tab to confirm the API is up.

### Tests fail with "Found multiple elements"

Check `globals: true` is still in the `test` block of `vite.config.js`. Without it, Testing Library can't clear the page between tests.

### Everything is slow

Each grid page makes about 40 requests (two per Pokemon). That's inherent to doing this in the browser without caching. It's normal for this project.

---

## Where to Go Next

Ideas to extend the app — each one is a new feature, so build it the same way: **Page → Route → Components**.

1. **Remember your favourites** — add a heart button and save the list in `localStorage`.
2. **Search as you type** — debounce the search box instead of waiting for Enter.
3. **Show evolutions** — PokeAPI has an `/evolution-chain` endpoint.
4. **Add a dark mode** — Tailwind's `dark:` prefix plus a toggle.
5. **Cache responses** — keep a `Map` of results so going back is instant.
6. **Write your own tests** — pick a feature above and test it the way the existing tests work.

---

## Conclusion

You've built a complete React application: a component architecture, real data loading with proper loading and error handling, client-side routing, responsive styling, and a test suite with full coverage of your code.

More importantly, you built it the way real features get built — one vertical slice at a time, each one finished and visible before starting the next. And you learned one pattern, three pieces of state plus one effect plus one cleanup, and applied it four times. That pattern is how most React apps load data, and you'll recognise it everywhere from here on.

Happy coding!
