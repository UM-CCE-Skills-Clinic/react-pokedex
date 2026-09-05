import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { loadMany } from '../utils';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { ErrorMessage, Loading, Pagination } from '../components/ui';

const PAGE_LIMIT = 20;

export default function TypePage() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [pokemon, setPokemon] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorType(null);

    axios
      .get(`https://pokeapi.co/api/v2/type/${type}`)
      .then(async (res) => {
        if (!isMounted) return;

        const rawPokemonList = res.data?.pokemon || [];
        const count = rawPokemonList.length;
        setTotalCount(count);
        setTotalPages(Math.ceil(count / PAGE_LIMIT));

        const offset = (page - 1) * PAGE_LIMIT;
        const pageItems = rawPokemonList.slice(offset, offset + PAGE_LIMIT).map((p) => p.pokemon);

        const loaded = await loadMany(pageItems);
        if (isMounted) {
          setPokemon(loaded);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.status === 404) {
            setErrorType('notFound');
          } else {
            setErrorType('network');
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type, page]);

  if (loading) return <Loading />;

  if (errorType === 'notFound') {
    return <ErrorMessage title="Type not found" text="That type does not exist." />;
  }

  if (errorType === 'network') {
    return <ErrorMessage title="Could not load this type" text="Please try again." />;
  }

  return (
    <div>
      <h1>{type} Pokemon</h1>
      <p>Filtered by type</p>
      <TypeFilter selectedType={type} />
      <p>{totalCount} Pokemon of this type</p>
      <PokemonGrid pokemon={pokemon} />
      <Pagination page={page} totalPages={totalPages} makeLink={(p) => `/type/${type}?page=${p}`} />
    </div>
  );
}
