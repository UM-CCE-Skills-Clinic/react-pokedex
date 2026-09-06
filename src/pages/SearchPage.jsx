import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading } from '../components/ui';
import { PAGE_SIZE, get, loadMany, loadPokemon } from '../utils';

// Search results. The query comes from the address bar, e.g. "/search?q=char".
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        // The API only understands lowercase names, so tidy the query first.
        const search = query.trim().toLowerCase();

        // Try an exact match, so "25" and "Pikachu" both jump to Pikachu.
        const exactMatch = await loadPokemon(search);

        if (exactMatch !== null) {
          if (!ignore) {
            setData({ pokemon: [exactMatch], totalCount: 1 });
            setLoading(false);
          }
          return;
        }

        // Otherwise look for every name that contains what the user typed.
        const all = await get('/pokemon?limit=2000&offset=0');
        const matches = all.results.filter((entry) => entry.name.includes(search));

        // Only load details for the first 20 matches - loading hundreds of
        // Pokemon at once would be very slow.
        const pokemon = await loadMany(matches.slice(0, PAGE_SIZE));

        if (!ignore) {
          setData({ pokemon, totalCount: matches.length });
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('The search failed. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [query]);

  if (error) {
    return <ErrorMessage title="Search failed" text={error} />;
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Search results
      </p>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          &ldquo;{query}&rdquo;
        </h1>
        <Link to="/" className="text-sm font-semibold text-slate-500">
          Clear search →
        </Link>
      </div>

      {!loading && data && (
        <p className="mt-1 text-sm text-slate-500">{data.totalCount} Pokemon found</p>
      )}

      <TypeFilter selectedType="" />

      {loading && <Loading text="Searching..." />}

      {!loading && data && (
        <div>
          {data.pokemon.length === 0 ? (
            <Empty text="No Pokemon matched that name or ID. Try something else." />
          ) : (
            <PokemonGrid pokemon={data.pokemon} />
          )}
        </div>
      )}
    </div>
  );
}
