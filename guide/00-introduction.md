# React Pokedex - Beginner's Guide

Welcome! This guide walks you through building a complete Pokedex web application with **React**, **React Router** and **Tailwind CSS**.

You start from a fresh Vite starter that already has the tests written for you, and you finish by opening a Pull Request.

## What We're Building

A Pokedex single-page app that:

- Shows a paginated grid of every Pokemon
- Shows a detail page for each Pokemon (description, abilities, animated stat bars)
- Lets you search Pokemon by name or ID
- Lets you filter Pokemon by type
- Shows friendly loading, empty and error screens

## Technologies Used

| Technology                         | Purpose                                                |
| ---------------------------------- | ------------------------------------------------------ |
| **React**                          | Builds the interface out of small, reusable components |
| **Vite**                           | Dev server and build tool — fast, with instant reloads |
| **React Router**                   | Shows a different page for each address in the browser |
| **Tailwind CSS v4**                | Utility-first styling, configured in CSS               |
| **Axios**                          | HTTP client for making API requests                    |
| **PokeAPI**                        | External API providing Pokemon data                    |
| **Vitest + React Testing Library** | Testing the helpers, components and pages              |

## Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **A GitHub account** - [Sign up here](https://github.com/)
4. **A code editor** - We recommend [VS Code](https://code.visualstudio.com/)
5. **Basic knowledge of:**
   - JavaScript (variables, functions, `async`/`await`, array methods like `map` and `filter`)
   - HTML and CSS basics
   - Command line/terminal usage

You do **not** need to know React already. This guide explains each React idea the first time it appears.

## How to Verify Installation

Open your terminal and run:

```bash
node --version
npm --version
git --version
```

You should see version numbers displayed. If not, install the missing tools first.

## Guide Structure

This guide is split into the following parts. **Follow them in order — each part builds on the previous one, and nothing should be skipped.**

| Part | Topic                             | Description                                         |
| ---- | --------------------------------- | --------------------------------------------------- |
| 01   | Project Setup                     | Fork, clone, branch, install, and tour the starter  |
| 02   | How the App Is Organised          | The folders, and how we build one feature at a time |
| 03   | Styling with Tailwind             | Set up the theme and page shell                     |
| 04   | Shared Helpers                    | Build `src/utils.js` — formatting and API loading   |
| 05   | **Feature 1: Browse the Pokedex** | The home page grid and pagination                   |
| 06   | **Feature 2: Pokemon Details**    | Click a card, see everything about it               |
| 07   | **Feature 3: Search**             | Find a Pokemon by name or ID                        |
| 08   | **Feature 4: Filter by Type**     | Make the coloured chips work                        |
| 09   | Testing                           | Understand and run the provided test suite          |
| 10   | Running the App                   | Use the app, then open your Pull Request            |

### How the feature parts work

Parts 05–08 each build **one complete feature**, always in the same order:

> **Page → Route → Components**

1. **Page** — what to load and what to show
2. **Route** — the address it lives at
3. **Components** — the pieces it's built from

Every feature part ends with a **See It Work** step, so you run the app and watch the new feature working before moving on. You never spend three parts building things you can't see.

> **Write all three steps before running.** Within a feature, the page imports components you create in Step 3 — so the browser will show an import error until that step is done. The "See It Work" step is the checkpoint. If you run mid-feature and see an error naming a file you haven't written yet, that's expected, not a mistake.

## What's Already Set Up

Your starter repository is a fresh Vite + React app, with the config files and the **complete test suite** already written:

```
react-pokedex/
├── guide/              # This tutorial
├── tests/              # The test suite — already written for you
│   ├── setup.js
│   ├── utils.test.js
│   ├── App.test.jsx
│   ├── layout/
│   ├── components/
│   └── pages/
├── public/             # Static assets
├── index.html          # The single HTML page
├── .gitignore
├── .prettierrc         # Code formatting config
├── eslint.config.js    # Linting rules
├── vite.config.js      # Vite + Tailwind + test config
├── package.json        # Dependencies and scripts
└── package-lock.json   # Locked dependency versions
```

You will be writing everything inside `src/` — the helpers, the components, the layout, the pages and the routes.

> **Why are the tests already written?** So you always have a target. They describe exactly what your code must do — if one fails, the message tells you what is missing.
>
> **You don't run them until Part 09.** While you're building, the check that matters is the app itself: every feature part ends with you opening the browser and using what you just built. The tests are the final verification once everything is in place.

## Key Concepts You'll Learn

### 1. Components

A React component is a function that returns markup (called JSX). You build a page by nesting small components inside bigger ones:

```jsx
function TypeBadge({ type }) {
  return <span>{type}</span>;
}
```

### 2. Props

Props are the values you pass **into** a component, like arguments to a function:

```jsx
<TypeBadge type="fire" />
```

### 3. State with `useState`

State is data a component remembers between redraws. When state changes, React redraws that component:

```jsx
const [text, setText] = useState('');
```

### 4. Side Effects with `useEffect`

`useEffect` runs code _after_ the component appears on screen — which is where we load data from the API:

```jsx
useEffect(() => {
  // load data here
}, [page]); // run again whenever `page` changes
```

`useState` and `useEffect` are the **only** two React hooks this app uses. There are no custom hooks and no data-fetching library.

### 5. Client-Side Routing

Unlike a server-rendered app, the browser downloads the app once and then swaps pages instantly. React Router decides which page matches the current address.

### 6. Testing What the User Sees

React Testing Library finds things the way a person would — by heading, link text or label — instead of by CSS class. That means your tests keep passing when you change the styling.

## Commit Message Format

When committing your work, follow the **Conventional Commits** format:

```
<type>: <description>
```

> **Where does my student info go?** Not in the commit — it goes in your **Pull Request description** at the very end (Part 13). The submission pipeline reads four fields from the PR body: `First Name`, `Last Name`, `Program`, and `UMindanao Email` (which must be a `@umindanao.edu.ph` address). The repo's PR template already lays these out for you.

### Commit Types

| Type       | When to Use                        |
| ---------- | ---------------------------------- |
| `feat`     | Adding a new feature               |
| `fix`      | Fixing a bug                       |
| `docs`     | Documentation changes              |
| `style`    | Code formatting (no logic changes) |
| `refactor` | Code restructuring                 |
| `test`     | Adding or updating tests           |
| `chore`    | Maintenance tasks                  |

### Example Commit Message

```
feat: add pokemon search page
```

## Tips for Beginners

1. **Type the code yourself** - Don't just copy-paste. Typing helps you learn.
2. **Read the comments** - They explain what each part does.
3. **Check the app after every feature** - Each feature part ends with a "See It Work" step. Don't skip it.
4. **Keep the dev server running** - Vite reloads the page the moment you save.
5. **Use `console.log()`** - Print values to understand data flow.
6. **Don't skip steps** - Each part builds on the previous one.
7. **Commit often** - Save your progress with meaningful commits.

## Getting Help

If you get stuck:

1. Check for typos in your code — especially file names and import paths
2. Make sure all files are saved
3. Read the error in the terminal **and** in the browser console (F12)
4. Read test failure messages carefully — they usually name the missing text or element

## Ready to Start?

Let's begin with [01 - Project Setup](./01-project-setup.md)!
