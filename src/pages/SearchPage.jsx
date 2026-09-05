import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { loadMany, loadPokemon } from '../utils';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading } from '../components/ui';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    async function performSearch() {
      const queryClean = query.trim().toLowerCase();

      if (!queryClean) {
        if (isMounted) {
          setPokemon([]);
          setLoading(false);
        }
        return;
      }

      try {
        let exactMatch = null;

        try {
          exactMatch = await loadPokemon(queryClean);
        } catch (err) {
          if (err.response?.status !== 404) {
            throw err;
          }
        }

        if (exactMatch) {
          if (isMounted) {
            setPokemon([exactMatch]);
            setLoading(false);
          }
          return;
        }

        // Fallback: list all Pokemon and filter partial matches
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
        const results = res.data?.results || [];
        const filtered = results.filter((p) => p.name.toLowerCase().includes(queryClean));

        const loaded = await loadMany(filtered);
        if (isMounted) {
          setPokemon(loaded);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [query]);

  if (loading) return <Loading text="Searching..." />;
  if (error) return <ErrorMessage title="Search failed" text="Please try again." />;

  return (
    <div>
      <h1>Search results</h1>
      <TypeFilter />
      <p>{pokemon.length} Pokemon found</p>
      {pokemon.length === 0 ? <Empty /> : <PokemonGrid pokemon={pokemon} />}
    </div>
  );
}
