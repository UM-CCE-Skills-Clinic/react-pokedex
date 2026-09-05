import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail';
import { ErrorMessage, Loading } from '../components/ui';
import { loadPokemon } from '../utils';

// Everything about one Pokemon, e.g. "/pokemon/pikachu".
export default function PokemonDetailsPage() {
    // `nameOrId` comes from the route "/pokemon/:nameOrId".
    const { nameOrId } = useParams();

    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        setLoading(true);
        setError(null);

        async function load() {
            try {
                // This is null when there is no Pokemon with that name or id.
                const result = await loadPokemon(nameOrId);

                if (!ignore) {
                    setPokemon(result);
                    setLoading(false);
                }
            } catch {
                if (!ignore) {
                    setError('We could not load this Pokemon. Please try again.');
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            ignore = true;
        };
    }, [nameOrId]);

    // Handling each case with its own early return keeps the JSX below simple.
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorMessage title="Could not load this Pokemon" text={error} />;
    }

    if (pokemon === null) {
        return (
            <ErrorMessage
                title="Pokemon not found"
                text={`There is no Pokemon with the name or ID "${nameOrId}".`}
            />
        );
    }

    return (
        <div>
            <Link to="/" className="text-sm font-semibold text-slate-500">
                ← Back to Pokedex
            </Link>

            <PokemonDetail pokemon={pokemon} />
        </div>
    );
}