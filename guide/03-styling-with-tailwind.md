# 03 - Styling with Tailwind

Before building components, let's set up the styling. Doing this first means everything you build from Part 04 onwards looks right immediately.

---

## What is Tailwind?

Tailwind gives you small single-purpose class names that you combine in your markup, instead of writing a separate CSS file:

```jsx
<div className="flex items-center gap-4 rounded-xl bg-white p-4">
```

| Class          | What it does          |
| -------------- | --------------------- |
| `flex`         | `display: flex`       |
| `items-center` | `align-items: center` |
| `gap-4`        | `gap: 1rem`           |
| `rounded-xl`   | rounded corners       |
| `bg-white`     | white background      |
| `p-4`          | padding on all sides  |

> **`className`, not `class`:** In JSX you write `className` because `class` is a reserved word in JavaScript. This trips up nearly everyone once.

---

## Step 1: Understand How Tailwind Is Wired In

Open `vite.config.js` and look at the top:

```javascript
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()]
  // ...
});
```

That `tailwindcss()` plugin scans your files for class names and generates exactly the CSS you used — nothing more. This is already set up for you; you don't need to change it.

> **Tailwind v4 has no `tailwind.config.js`.** Older tutorials will tell you to create one. In v4 you configure the theme in your CSS file instead, which is what we do next.

---

## Step 2: Write the Stylesheet

1. Open `src/index.css` and **replace everything** in it with:

```css
@import 'tailwindcss';

/*
 * Tailwind v4 is set up here in CSS - there is no tailwind.config.js file.
 * Anything you define below becomes a class you can use:
 *   --color-brand-600  ->  bg-brand-600, text-brand-600, ...
 */
@theme {
  --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;

  --color-brand-50: #fff1f2;
  --color-brand-100: #ffe0e3;
  --color-brand-400: #f4566b;
  --color-brand-600: #cc163a;
}

/* Make the stat bars grow from empty when the details page opens. */
.stat-bar {
  animation: grow 0.8s ease-out;
}

@keyframes grow {
  from {
    width: 0;
  }
}
```

2. Save the file.

### What each part does

**`@import 'tailwindcss';`** — pulls in all of Tailwind. This one line replaces the three `@tailwind` lines older versions used.

**`@theme { ... }`** — your design tokens. Every variable here becomes usable class names:

| You write           | You get to use                                            |
| ------------------- | --------------------------------------------------------- |
| `--color-brand-600` | `bg-brand-600`, `text-brand-600`, `border-brand-600`, ... |
| `--font-sans`       | applied to the whole page by default                      |

We define a red "brand" colour because a Pokeball is red. Tailwind's built-in colours (`slate`, `white`, and so on) still work everywhere.

**`.stat-bar`** — one small hand-written animation, used by the detail page in Feature 2. Each stat bar has its width set inline (say `width: 35%`), and this keyframe animates it _from_ `0` up to whatever that width is, so the bars fill up when the page opens. Pure CSS — no JavaScript needed.

---

## Step 3: Update the HTML Page

The whole app lives in one HTML file. Let's set the title and load the font.

1. Open `index.html` and replace everything with:

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pokedex</title>
    <meta
      name="description"
      content="A Pokedex - browse, search and inspect every Pokemon and its stats."
    />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23e3284a'/%3E%3Cpath d='M2 50h96' stroke='%23111' stroke-width='8'/%3E%3Ccircle cx='50' cy='50' r='14' fill='%23fff' stroke='%23111' stroke-width='8'/%3E%3C/svg%3E"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

2. Save the file.

### The two important lines

```html
<div id="root"></div>
```

This empty div is where your entire React app gets drawn. Everything you see in the browser goes inside it.

```html
<script type="module" src="/src/main.jsx"></script>
```

This starts your app. `main.jsx` finds that root div and hands it to React.

> **The favicon** is a Pokeball drawn as SVG, written directly in the address instead of loading a separate file. That's why it looks like gibberish.

---

## Step 4: Checkpoint

1. Make sure the dev server is running:

```bash
npm run dev
```

2. Look at the browser tab — the title should now read **Pokedex**, with a small red Pokeball icon.

3. The page itself still shows the default Vite starter. That's fine — Feature 1 replaces it with the real Pokedex.

> **Nothing changed?** Hard-refresh the browser (`Ctrl+Shift+R`, or `Cmd+Shift+R` on Mac). If the dev server was already running when you edited `index.html`, it may need a restart: `Ctrl+C`, then `npm run dev`.

---

## A Few Tailwind Classes You'll See a Lot

You don't need to memorise these — just recognise the pattern when you meet them:

| Pattern                | Meaning                | Example                            |
| ---------------------- | ---------------------- | ---------------------------------- |
| `p-4`, `px-4`, `mt-2`  | padding / margin       | `px-4` = padding left and right    |
| `flex`, `grid`         | layout mode            | `flex flex-col` = stack vertically |
| `gap-3`                | space between children |                                    |
| `text-sm`, `font-bold` | text size and weight   |                                    |
| `rounded-xl`           | corner rounding        |                                    |
| `sm:`, `lg:`           | only on bigger screens | `sm:grid-cols-3`                   |
| `hover:`               | only while hovering    | `hover:bg-slate-100`               |

The responsive prefixes are how the grid goes from 2 columns on a phone to 5 on a wide screen:

```jsx
className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
```

---

## Step 5: Commit Your Progress

```bash
git add .
git commit -m "style: set up tailwind theme and page shell"
```

---

## What's Next?

Styling is ready. Now let's write the helpers that fetch and tidy up the Pokemon data.

Next: [04 - Shared Helpers](./04-shared-helpers.md)
