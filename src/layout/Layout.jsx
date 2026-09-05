import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

// The frame that every page is drawn inside: header, then the page, then footer.
// React Router puts the current page where <Outlet /> is.

function SearchBar() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (text.trim() === '') {
      navigate('/');
    } else {
      navigate(`/search?q=${encodeURIComponent(text.trim())}`);
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

        <SearchBar />
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
