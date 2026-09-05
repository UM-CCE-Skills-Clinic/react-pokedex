import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadPokemon } from '../utils';
import PokemonDetail from '../components/PokemonDetail';
import { ErrorMessage, Loading } from '../components/ui';

export default function PokemonDetailsPage() {
  const { nameOrId } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorType(null);

    loadPokemon(nameOrId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setErrorType('notFound');
        } else {
          setPokemon(data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setErrorType('network');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [nameOrId]);

  if (loading) return <Loading />;

  if (errorType === 'notFound') {
    return (
      <div>
        <Link to="/">← Back to Pokedex</Link>
        <ErrorMessage title="Pokemon not found" text="That Pokemon does not exist." />
      </div>
    );
  }

  if (errorType === 'network') {
    return (
      <div>
        <Link to="/">← Back to Pokedex</Link>
        <ErrorMessage title="Could not load this Pokemon" text="Please try again." />
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← Back to Pokedex</Link>
      <PokemonDetail pokemon={pokemon} />
    </div>
  );
}
