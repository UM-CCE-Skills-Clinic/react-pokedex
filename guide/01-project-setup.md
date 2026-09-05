# 01 - Project Setup

In this part you'll fork the repository, clone it, create your branch, install the packages, and take a tour of what the starter already gives you.

---

## Step 1: Fork the Repository

1. Go to the repository on GitHub
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the destination
4. Wait for the fork to complete

You now have your own copy of the repository under your GitHub account.

---

## Step 2: Clone Your Fork

1. Open your terminal
2. Run the following command (replace `YOUR-USERNAME` with your GitHub username, and `react-pokedex` with the repository name if it differs):

```bash
git clone https://github.com/YOUR-USERNAME/react-pokedex.git
```

3. Navigate into the project folder:

```bash
cd react-pokedex
```

---

## Step 3: Create Your Branch

1. Create a new branch using the format `lastname/pokedex-pull-request`:

```bash
git checkout -b dela-cruz/pokedex-pull-request
```

2. Replace `dela-cruz` with your actual last name (use lowercase and hyphens for spaces)

### Branch Naming Examples

| Your Name | Branch Name |
|-----------|-------------|
| Juan Dela Cruz | `dela-cruz/pokedex-pull-request` |
| Maria Santos | `santos/pokedex-pull-request` |
| John Smith | `smith/pokedex-pull-request` |

---

## Step 4: Install Dependencies

1. Run the following command to install all packages:

```bash
npm install
```

2. Wait for the installation to complete

This reads `package.json` and installs everything into `node_modules/`.

### What Gets Installed

**Production Dependencies** — these ship to the browser:

| Package | Purpose |
|---------|---------|
| `react` | The library that builds the interface |
| `react-dom` | Puts React components onto the web page |
| `react-router-dom` | Shows a different page per address |
| `axios` | HTTP client for calling PokeAPI |

**Development Dependencies** — these only run on your machine:

| Package | Purpose |
|---------|---------|
| `vite` | Dev server and production build tool |
| `@vitejs/plugin-react` | Teaches Vite to understand JSX |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `vitest` | Test runner |
| `@vitest/coverage-v8` | Coverage reports |
| `jsdom` | A fake browser so tests can render HTML |
| `@testing-library/react` | Renders components in tests |
| `@testing-library/jest-dom` | Extra checks like `toBeInTheDocument()` |
| `@testing-library/user-event` | Simulates typing and clicking |
| `eslint` + plugins | Code linting (find errors/issues) |
| `prettier` | Code formatting |

---

## Step 5: Check the Starter Runs

1. Start the dev server:

```bash
npm run dev
```

2. You should see something like:

```
  VITE v8.2.2  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

3. Your browser should open `http://localhost:5173`.

If you are following the guide from a clean starter commit, you will see the **default Vite + React welcome page** with the spinning logos and a counter button. If you are reading the completed repository, you will see the Pokedex reference implementation instead; the later parts explain how each file was built.

4. Leave the dev server running in this terminal. Open a **second terminal** for the other commands in this guide.

> **Stopping the server:** press `Ctrl+C` in its terminal.

---

## Step 6: Look at the Tests

The test suite is already written for you. Have a look at what's in `tests/`, but **don't run it yet** — you haven't written any of the app, so every test would fail with "Failed to resolve import". We run the whole suite once at the end, in Part 09, when there's something to test.

### What's in `tests/`

```
tests/
├── setup.js                        # runs before every test file
├── utils.test.js                   # Part 04
├── App.test.jsx                    # Features 1-4
├── layout/
│   └── Layout.test.jsx             # Feature 3
├── components/
│   ├── ui.test.jsx                 # Feature 1
│   ├── PokemonGrid.test.jsx        # Feature 1
│   └── PokemonDetail.test.jsx      # Feature 2
└── pages/
    ├── HomePage.test.jsx           # Feature 1
    ├── PokemonDetailsPage.test.jsx # Feature 2
    ├── SearchPage.test.jsx         # Feature 3
    └── TypePage.test.jsx           # Feature 4
```

The `tests/` folder mirrors `src/`, so the tests for `src/pages/HomePage.jsx` live in `tests/pages/HomePage.test.jsx`.

Think of them as the finish line: when all 73 pass in Part 09, your app is built correctly.

> **Do not edit the tests.** They define what your code must do. If a test fails, fix your code, not the test.

---

## Step 7: Create the Project Folders (starter check)

The completed repository may already contain the folders and source files described below. If they are present, leave them in place and continue to Step 8. These commands are for a clean Vite starter only.

1. Create the folders your application code will live in:

**Mac/Linux:**
```bash
mkdir -p src/components src/layout src/pages
```

**Windows (Command Prompt):**
```cmd
mkdir src\components src\layout src\pages
```

**Windows (PowerShell):**
```powershell
mkdir src/components, src/layout, src/pages
```

2. Delete the starter files we won't use:

**Mac/Linux:**
```bash
rm -f src/App.css src/assets/react.svg
```

**Windows (PowerShell):**
```powershell
Remove-Item src/App.css, src/assets/react.svg -ErrorAction SilentlyContinue
```

> Don't worry if a file isn't there — that just means your starter didn't include it.

3. Your project should now look like this:

```
react-pokedex/
├── guide/                # This tutorial
├── public/               # Static assets
├── src/                  # Your application code
│   ├── components/       # (you created this — empty for now)
│   ├── layout/           # (you created this — empty for now)
│   ├── pages/            # (you created this — empty for now)
│   ├── App.jsx           # starter version — you'll replace it in Feature 1
│   ├── index.css         # starter version — you'll replace it in Part 03
│   └── main.jsx          # starter version — you'll check it in Feature 1
├── tests/                # The test suite (already written)
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

---

## Available npm Scripts

The `package.json` is already configured with these scripts:

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start the dev server with instant reload |
| `build` | `npm run build` | Build the site into `dist/` |
| `preview` | `npm run preview` | Preview the built site |
| `test` | `npm test` | Run tests and re-run them as you edit |
| `test:run` | `npm run test:run` | Run the tests once |
| `test:ci` | `npm run test:ci` | Run once with a coverage report |
| `lint` | `npm run lint` | Check code for errors |
| `lint:fix` | `npm run lint:fix` | Auto-fix linting errors |
| `format` | `npm run format` | Format code with Prettier |
| `format:check` | `npm run format:check` | Check if code is formatted |
| `ci` | `npm run ci` | Format check → lint → test → build |

> **Note:** You don't need to modify `package.json` or `vite.config.js`. Everything is already set up for you.

---

## Step 8: Verify Setup

1. Check you're on your branch:

```bash
git branch
```

You should see your branch name highlighted (e.g., `* dela-cruz/pokedex-pull-request`).

2. Check the packages installed:

```bash
npm list --depth=0
```

---

## Step 9: Commit Your Progress

1. Stage all your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "chore: set up project structure"
```

---

## What's Next?

Your environment is ready and you know where the tests live. Next we'll look at how the app is organised before writing any code.

Next: [02 - How the App Is Organised](./02-how-the-app-is-organised.md)
