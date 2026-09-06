import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading, Pagination } from '../components/ui';
import { PAGE_SIZE, get, loadMany } from '../utils';

export default function TypePage() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        const result = await get(`/type/${type}`);

        if (result === null) {
          if (!ignore) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        const members = result.pokemon.map((entry) => entry.pokemon);
        const offset = (page - 1) * PAGE_SIZE;
        const pokemon = await loadMany(members.slice(offset, offset + PAGE_SIZE));

        if (!ignore) {
          setData({
            pokemon,
            totalCount: members.length,
            totalPages: Math.ceil(members.length / PAGE_SIZE)
          });
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError('We could not load this type. Please try again.');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [type, page]);

  if (error) {
    return <ErrorMessage title="Could not load this type" text={error} />;
  }

  if (!loading && data === null) {
    return (
      <ErrorMessage title="Type not found" text={`There is no Pokemon type called "${type}".`} />
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Filtered by type
      </p>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold capitalize tracking-tight text-slate-900 sm:text-3xl">
          {type} Pokemon
        </h1>
        <Link to="/" className="text-sm font-semibold text-slate-500">
          Show all →
        </Link>
      </div>

      {!loading && data && (
        <p className="mt-1 text-sm text-slate-500">{data.totalCount} Pokemon of this type</p>
      )}

      <TypeFilter selectedType={type} />

      {loading && <Loading />}

      {!loading && data && (
        <div>
          {data.pokemon.length === 0 ? <Empty /> : <PokemonGrid pokemon={data.pokemon} />}

          <Pagination
            page={page}
            totalPages={data.totalPages}
            makeLink={(target) => `/type/${type}?page=${target}`}
          />
        </div>
      )}
    </div>
  );
}
