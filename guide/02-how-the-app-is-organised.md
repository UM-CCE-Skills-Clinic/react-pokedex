# 02 - How the App Is Organised

Before we write code, let's understand how the pieces fit together. This explains _why_ the files are arranged the way they are.

---

## The Big Picture

A React app is a tree of components. The browser has one HTML page, and React fills it in:

```
index.html          the single web page, with an empty <div id="root">
    │
    ▼
src/main.jsx        finds that div and starts React
    │
    ▼
src/App.jsx         decides which page matches the address
    │
    ▼
src/layout/         the frame: header, search box, footer
    │
    ▼
src/pages/          the page itself: Home, Search, Type, Details
    │
    ▼
src/components/     the reusable pieces the pages are built from
    │
    ▼
src/utils.js        formatting helpers + the calls to PokeAPI
    │
    ▼
PokeAPI             https://pokeapi.co
```

Each arrow points **downwards only**. A page uses components; a component never reaches back up to a page.

---

## Step 1: Understand Each Folder

### `src/pages/` — one file per screen

**Job:** Load the data for one screen and decide what to show.

A page is where `useState` and `useEffect` live. It asks `utils.js` for data, keeps track of whether it's still loading, and then hands the result to components.

```jsx
// A page loads its own data...
const [data, setData] = useState(null);

useEffect(() => {
  // ...then passes it down to a component
}, [page]);

return <PokemonGrid pokemon={data.pokemon} />;
```

### `src/components/` — reusable pieces

**Job:** Show something on screen. Components receive data through props and (almost always) do no loading of their own.

```jsx
// Give it a Pokemon, it draws a card. That's all it does.
<PokemonCard pokemon={pikachu} />
```

### `src/layout/` — the frame around every page

**Job:** The header, the search box and the footer — the parts that stay on screen no matter which page you're on.

### `src/utils.js` — shared helpers

**Job:** The things more than one page needs, so they aren't copy-pasted four times:

- talking to PokeAPI (`get`, `loadPokemon`, `loadMany`)
- formatting (`formatName`, `formatNumber`, `getTypeColor`)

### `src/App.jsx` — the route table

**Job:** Map each address to a page.

---

## Step 2: Understand Why We Split It Up

### 1. Each file has one job

When the type colours look wrong, you know to open `utils.js`. When the search page misbehaves, you open `SearchPage.jsx`. You never have to read the whole app to fix one thing.

### 2. Components can be reused

`PokemonGrid` is written once and used by three different pages — Home, Search and Type. Fix a bug in the card, and all three pages get the fix.

### 3. Only one file knows about PokeAPI

Every request goes through `get()` in `utils.js`. If PokeAPI ever changed its address, you'd edit one line.

### 4. It makes testing possible

Because components just take props and return markup, a test can hand them fake data and check what appears — no network, no server.

---

## Step 3: Understand How Data Flows

Here's what happens when someone opens the home page:

```
1. Browser goes to  /
                    │
2. App.jsx matches  "/"  →  renders <HomePage /> inside <Layout />
                    │
3. HomePage's useEffect runs
                    │
4. It calls  get('/pokemon?limit=20&offset=0')   from utils.js
                    │
5. That returns 20 names, so it calls loadMany(...)
                    │
6. loadMany loads the details for all 20 at the same time
                    │
7. HomePage calls setData(...)  →  React redraws the page
                    │
8. <PokemonGrid pokemon={...} />  draws 20 <PokemonCard />s
```

While steps 4–6 are happening, `loading` is `true`, so the page shows a spinner instead.

---

## Step 4: Understand the Three States of a Page

Every page in this app can be in one of three situations, and each one shows something different:

| State             | What the user sees                                              |
| ----------------- | --------------------------------------------------------------- |
| `loading` is true | A spinner — "Loading Pokemon..."                                |
| `error` is set    | A friendly error message with a link home                       |
| we have data      | The actual content (or "No Pokemon found" if the list is empty) |

Handling all three every time is what makes the app feel finished instead of broken.

---

## Step 5: Know Where Things Live

This is the structure you're going to build:

```
src/
├── main.jsx                    starts the app                    (Feature 1)
├── App.jsx                     the route table                   (Features 1-4)
├── index.css                   Tailwind theme                    (Part 03)
├── utils.js                    shared helpers                    (Part 04)
│
├── layout/
│   └── Layout.jsx              header, search box, footer        (Features 1, 3)
│
├── components/
│   ├── ui.jsx                  loading / empty / error / pager   (Feature 1)
│   ├── PokemonGrid.jsx         cards, badges, type filters       (Feature 1)
│   └── PokemonDetail.jsx       the big detail card               (Feature 2)
│
└── pages/
    ├── HomePage.jsx            the full Pokedex, 20 at a time    (Feature 1)
    ├── PokemonDetailsPage.jsx  everything about one Pokemon      (Feature 2)
    ├── SearchPage.jsx          search results                    (Feature 3)
    └── TypePage.jsx            Pokemon of one type               (Feature 4)
```

---

## Step 6: Understand How We'll Build It

There are two ways to build an app like this.

**Bottom-up** would mean writing every helper, then every component, then every page, then the routes. The problem: nothing appears on screen until the very last step. You'd spend hours writing files on faith, and if something is wrong you'd find out at the end with no idea which file caused it.

**Feature by feature** is what we'll do instead. Each part builds one complete, working slice of the app:

| Part | Feature            | You can see                       |
| ---- | ------------------ | --------------------------------- |
| 05   | Browse the Pokedex | A grid of Pokemon with pagination |
| 06   | Pokemon details    | Click a card, get its full page   |
| 07   | Search             | Find a Pokemon by name or ID      |
| 08   | Filter by type     | The coloured chips work           |

Within each feature, always the same three steps:

```
1. Page        →  what to load and what to show
2. Route       →  the address it lives at
3. Components  →  the pieces it's built from
```

Then you run the app and **see the feature working** before starting the next one.

### Why Page first?

Because the page is the thing you're actually trying to build. Starting there means you decide what you need _before_ writing it — and the components you then write exist to serve a real requirement, not a guess.

It also means every part ends with something you can look at. If Feature 3 breaks, you know the problem is in Feature 3, because Features 1 and 2 were working when you left them.

> **One thing to expect:** within a feature, the page you write in Step 1 imports components you don't create until Step 3. If you run the dev server in between, you'll see an import error naming a file you haven't written yet. That's normal — write all three steps, then run.

### Two files are shared by every feature

`src/utils.js` (Part 04) and `src/App.jsx` are used by all four features. We build `utils.js` completely up front, and `App.jsx` grows by one route per feature.

---

## Step 7: Meet PokeAPI

We use five endpoints from [pokeapi.co](https://pokeapi.co). No API key is needed.

| Endpoint                  | Description                  | Example                      |
| ------------------------- | ---------------------------- | ---------------------------- |
| `/pokemon?limit=&offset=` | One page of names            | `/pokemon?limit=20&offset=0` |
| `/pokemon/{name}`         | Full details for one Pokemon | `/pokemon/pikachu`           |
| `/pokemon-species/{id}`   | Description and category     | `/pokemon-species/25`        |
| `/type`                   | The list of all types        | `/type`                      |
| `/type/{name}`            | Every Pokemon of one type    | `/type/electric`             |

### Two things to know about the list endpoint

**1. It only gives you names.** `/pokemon?limit=20` returns this:

```json
{
  "count": 1351,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur", "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```

No pictures, no types. To draw a card we need the details, so showing 20 cards means 20 extra requests. That's what `loadMany` is for — it runs them all at the same time instead of one after another.

**2. Details come from two places.** `/pokemon/pikachu` has the stats and picture, but the _description_ and _category_ live at `/pokemon-species/25`. Our `loadPokemon` helper fetches both and merges them into one tidy object.

### What one Pokemon looks like from the API

```json
{
  "id": 25,
  "name": "pikachu",
  "height": 4,
  "weight": 60,
  "types": [{ "type": { "name": "electric" } }],
  "stats": [{ "base_stat": 35, "stat": { "name": "hp" } }],
  "abilities": [{ "ability": { "name": "static" }, "is_hidden": false }],
  "sprites": {
    "front_default": "https://...",
    "other": { "official-artwork": { "front_default": "https://..." } }
  }
}
```

Notice how awkward that is — `types[0].type.name` just to get `"electric"`, and height in _decimetres_. Part 04 flattens all of it into an object our components can use directly.

---

## What's Next?

Now that you know the shape of the app, let's set up the styling so everything you build looks right from the start.

Next: [03 - Styling with Tailwind](./03-styling-with-tailwind.md)
