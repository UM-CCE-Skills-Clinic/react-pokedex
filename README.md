# ⚛️ React Pokedex — Build It Yourself

A hands-on tutorial for building a **Pokedex single-page application** with React, React Router and Tailwind CSS. You learn by building: you start from a fresh Vite starter with the **test suite already written**, and you create everything in `src/` yourself, step by step, by following the guide.

![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7.x-ca4245?style=flat&logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5.x-6e9f18?style=flat&logo=vitest&logoColor=white)

> This is the React rewrite of the Express + EJS Pokedex in the folder above.

---

## 📚 Start Here — The Guide

> ### 👉 **[Open the Guide → Part 00: Introduction](guide/00-introduction.md)**
>
> This is the heart of the project. The guide walks you through building the **entire** app from a fresh Vite starter to a finished, tested application — in order, with nothing skipped.

| Part | Topic                          | Link                                         |
| ---- | ------------------------------ | -------------------------------------------- |
| 00   | Introduction                   | [Read](guide/00-introduction.md)             |
| 01   | Project Setup                  | [Read](guide/01-project-setup.md)            |
| 02   | How the App Is Organised       | [Read](guide/02-how-the-app-is-organised.md) |
| 03   | Styling with Tailwind          | [Read](guide/03-styling-with-tailwind.md)    |
| 04   | Shared Helpers                 | [Read](guide/04-shared-helpers.md)           |
| 05   | Feature 1: Browse the Pokedex  | [Read](guide/05-feature-browse-pokedex.md)   |
| 06   | Feature 2: Pokemon Details     | [Read](guide/06-feature-pokemon-details.md)  |
| 07   | Feature 3: Search              | [Read](guide/07-feature-search.md)           |
| 08   | Feature 4: Filter by Type      | [Read](guide/08-feature-filter-by-type.md)   |
| 09   | Testing                        | [Read](guide/09-testing.md)                  |
| 10   | Running the App & Pull Request | [Read](guide/10-running-and-pull-request.md) |

> ℹ️ **You write every file in `src/` yourself.** The starter gives you the config files and the complete test suite — the helpers, layout, components, pages and routes are yours to build across Parts 01–10.

Parts 05–08 each build **one complete feature** in the same order — **Page → Route → Components** — and end with a **See It Work** step, so you open the browser and use the new feature before moving on.

---

## ✨ What You'll Build

- 📋 Paginated grid of every Pokemon, 20 at a time
- 🔍 Search Pokemon by name or ID
- 🏷️ Filter Pokemon by type with coloured chips
- 📄 Detail pages with description, abilities and animated stat bars
- 🧭 Client-side routing, so the back button and shared links both work
- 🎨 Friendly loading, empty and error screens styled with Tailwind CSS

## 🛠️ Tech Stack

| Technology                         | Purpose                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| **React 19**                       | Builds the interface out of small, reusable components             |
| **Vite**                           | Dev server and build tool — fast, with instant reloads             |
| **React Router**                   | Shows a different page for each address in the browser             |
| **Tailwind CSS v4**                | Utility-first styling, configured in CSS — no `tailwind.config.js` |
| **Axios**                          | HTTP client                                                        |
| **PokeAPI**                        | Pokemon data source                                                |
| **Vitest + React Testing Library** | Testing the helpers, components and pages                          |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22.12 or newer** (Vitest 5 does not support Node 20)
- npm (comes with Node.js)
- Git and a GitHub account

### Set up your workspace

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/react-pokedex.git
   cd react-pokedex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Open the guide and start building**

   👉 **[guide/00-introduction.md](guide/00-introduction.md)**

> Once you reach **Part 05**, `npm run dev` will start the app at `http://localhost:5173`.

## 📜 Available Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload      |
| `npm run build`        | Build the site into `dist/`               |
| `npm run preview`      | Preview the built site                    |
| `npm test`             | Run the tests and watch for changes       |
| `npm run test:run`     | Run the tests once                        |
| `npm run test:ci`      | Run the tests once with a coverage report |
| `npm run lint`         | Check the code with ESLint                |
| `npm run lint:fix`     | Fix linting errors automatically          |
| `npm run format`       | Format the code with Prettier             |
| `npm run format:check` | Check code formatting                     |
| `npm run ci`           | Format check → lint → test → build        |

---

## 🏗️ Project Architecture

Each page loads its own data, so you can read any single page top to bottom and understand everything it does:

```
Route → Page → Components → utils.js → External API (PokeAPI)
```

The `src/` structure you create as you follow the guide:

```
src/
├── main.jsx                    starts the app (from the Vite starter)
├── App.jsx                     the list of pages and their addresses
├── index.css                   Tailwind setup and theme colours (Part 03)
├── utils.js                    shared helpers (Part 04)
│
├── layout/
│   └── Layout.jsx              header, search box and footer
│
├── components/
│   ├── PokemonGrid.jsx         the card grid, cards and type filters
│   ├── PokemonDetail.jsx       the big card on the details page
│   └── ui.jsx                  loading, empty, error and pagination
│
└── pages/
    ├── HomePage.jsx            the full Pokedex, 20 at a time
    ├── SearchPage.jsx          search results
    ├── TypePage.jsx            Pokemon of one type
    └── PokemonDetailsPage.jsx  everything about one Pokemon

tests/                          already written — one test file per source file
guide/                          the step-by-step tutorial
.github/
├── workflows/ci.yml            the submission pipeline
└── pull_request_template.md    the PR description template
```

### Pages

| Address              | Page               | Example              |
| -------------------- | ------------------ | -------------------- |
| `/`                  | HomePage           | `/?page=3`           |
| `/search`            | SearchPage         | `/search?q=char`     |
| `/type/:type`        | TypePage           | `/type/water?page=2` |
| `/pokemon/:nameOrId` | PokemonDetailsPage | `/pokemon/pikachu`   |

The page number and search text live in the address bar, so the back button and shared links both work.

### How a page loads its data

Every page does the same thing, with only `useState` and `useEffect`:

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let ignore = false;

  async function load() {
    try {
      const result = await get('/pokemon/pikachu');
      if (!ignore) {
        setData(result);
        setLoading(false);
      }
    } catch {
      if (!ignore) {
        setError('Something went wrong.');
        setLoading(false);
      }
    }
  }

  load();

  // Runs when the input changes, so a slow old answer is thrown away.
  return () => {
    ignore = true;
  };
}, [page]);
```

Read one page and you can read them all. There are no custom hooks and no data-fetching library.

### What is in `utils.js`

Only the things more than one page needs, so they are not copy-pasted four times:

| Helper                       | What it does                                        |
| ---------------------------- | --------------------------------------------------- |
| `get(path)`                  | One request to PokeAPI. Returns `null` on a 404     |
| `loadPokemon(nameOrId)`      | One Pokemon, tidied up. `null` if it does not exist |
| `loadMany(entries)`          | Loads details for a list of Pokemon at once         |
| `getTypeColor(type)`         | The colour for a type, e.g. fire is orange          |
| `formatName`, `formatNumber` | `"mr-mime"` → `"Mr Mime"`, `25` → `"025"`           |

## 🧪 Testing

In **[Part 09](guide/09-testing.md)** you'll understand and run the test suite that ships with the starter:

```bash
npm test           # watches for changes while you work
npm run test:run   # runs once
npm run test:ci    # runs once and prints a coverage report
```

The tests use [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react). They live in `tests/`, laid out to match `src/`, so the tests for `src/pages/HomePage.jsx` are in `tests/pages/HomePage.test.jsx`.

They never touch the real PokeAPI. Instead they replace `axios.get` with a fake that returns whatever the test needs:

```js
vi.spyOn(axios, 'get').mockResolvedValue({ data: pikachuResponse });
```

Testing Library checks what a person would see on screen — a heading, a link, a button — rather than how the component is built inside. So the tests keep passing when you change the styling.

The tests cover:

| File            | What its tests check                                                   |
| --------------- | ---------------------------------------------------------------------- |
| `utils`         | Formatting, 404s becoming `null`, and building the tidy Pokemon object |
| `ui`            | Pagination links, and the loading / empty / error messages             |
| `PokemonGrid`   | Cards show the name, number, types and picture, and link correctly     |
| `PokemonDetail` | Stats, abilities, hidden badge, height and weight                      |
| `Layout`        | Searching takes you to the search page                                 |
| Pages           | Loading first, then results — plus "not found" and error states        |
| `App`           | Each address shows the right page                                      |

---

## 🤖 CI Pipeline

`.github/workflows/ci.yml` runs on every pull request and has four jobs:

| Job                                 | What it does                                                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Extract Student Info**            | Reads `First Name`, `Last Name`, `Program` and `UMindanao Email` from the PR description, checks all four are present, validates the email domain, and checks the PR title |
| **Verify PR Author Wrote The Code** | Compares every commit's GitHub account against whoever opened the PR                                                                                                       |
| **Format, Lint, Test & Build**      | `format:check` → `lint` → `test:ci` → `build`, then confirms `dist/` really contains the HTML, JS and CSS                                                                  |
| **Submit Student Info**             | Runs only after all three pass, and POSTs the details to the submission API                                                                                                |

Run the same gates locally before opening a PR:

```bash
npm run ci
```

### Opening a pull request

`.github/pull_request_template.md` pre-fills the description. Two things the pipeline is strict about:

- **All four student fields are required**, with the labels spelled exactly as in the template, and the email must end in `@umindanao.edu.ph`.
- **The PR title must be `<Last Name>/pokedex-pull-request`**, using the Last Name field exactly as you typed it. `Last Name: Dela Cruz` means the title is `Dela Cruz/pokedex-pull-request` — note this is _not_ the same as your lowercase branch name.

### Secrets

The submit job needs two repository secrets: `SUBMISSION_API_URL` and `SUBMISSION_API_TOKEN`. Without them the first three jobs still run; only the final submission step will fail.

---

## 📝 Notes

- The Express version fetched Pokemon on the server. Here the browser does it, so loading a page of 20 Pokemon means 20 small requests — `loadMany` uses `Promise.all` to run them at the same time.
- Tailwind v4 is configured in `src/index.css` with `@theme`, so there is no `tailwind.config.js`.
- CI pins **Node 22**. Vitest 5 requires `^22.12 || ^24 || >=26`, so the Node 20 used by the Express version of this project will not work here.

---

**Happy Coding! 🎮**
