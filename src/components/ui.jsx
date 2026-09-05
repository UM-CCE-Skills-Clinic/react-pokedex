import { Link } from 'react-router-dom';

export function Loading({ text = 'Loading Pokemon...' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      <p className="text-sm font-semibold text-slate-500">{text}</p>
    </div>
  );
}

export function Empty({ text = "We couldn't find any Pokemon matching that." }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl">
        🔍
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-800">No Pokemon found</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      <Link
        to="/"
        className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to all Pokemon
      </Link>
    </div>
  );
}

export function ErrorMessage({ title = 'Something went wrong', text }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{text}</p>
      <Link
        to="/"
        className="mt-7 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Back to Pokedex
      </Link>
    </div>
  );
}

export function Pagination({ page, totalPages, makeLink }) {
  if (totalPages <= 1) return null;

  const buttonStyle =
    'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100';
  const disabledStyle =
    'rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-slate-200';

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link to={makeLink(page - 1)} className={buttonStyle}>
          ← Previous
        </Link>
      ) : (
        <span className={disabledStyle}>← Previous</span>
      )}
      <span className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">
        {page} <span className="font-normal text-slate-400">/ {totalPages}</span>
      </span>
      {page < totalPages ? (
        <Link to={makeLink(page + 1)} className={buttonStyle}>
          Next →
        </Link>
      ) : (
        <span className={disabledStyle}>Next →</span>
      )}
    </div>
  );
}
