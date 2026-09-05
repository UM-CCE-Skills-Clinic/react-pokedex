import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { loadMany } from '../utils';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading, Pagination } from '../components/ui';

const PAGE_LIMIT = 20;

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [pokemon, setPokemon] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const offset = (page - 1) * PAGE_LIMIT;

    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_LIMIT}&offset=${offset}`)
      .then(async (res) => {
        if (!isMounted) return;

        const count = res.data?.count || 0;
        const results = res.data?.results || [];

        setTotalPages(Math.ceil(count / PAGE_LIMIT));

        if (results.length === 0) {
          setPokemon([]);
          setLoading(false);
          return;
        }

        const loadedPokemon = await loadMany(results);
        if (isMounted) {
          setPokemon(loadedPokemon);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage title="Could not load Pokemon" text="Please try again." />;

  return (
    <div>
      <h1>Discover every Pokemon</h1>
      <TypeFilter />
      {pokemon.length === 0 ? (
        <Empty />
      ) : (
        <>
          <PokemonGrid pokemon={pokemon} />
          <Pagination page={page} totalPages={totalPages} makeLink={(p) => `/?page=${p}`} />
        </>
      )}
    </div>
  );
}
