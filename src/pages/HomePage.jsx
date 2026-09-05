import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PokemonGrid, { TypeFilter } from '../components/PokemonGrid';
import { Empty, ErrorMessage, Loading, Pagination } from '../components/ui';
import { PAGE_SIZE, get, loadMany } from '../utils';

// The home page: the full Pokedex, 20 at a time.
export default function HomePage() {
    // The page number comes from the address bar, e.g. "/?page=3".
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    // Three pieces of state: what we loaded, and how the loading is going.
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Set to true by the cleanup below. It stops an old, slow answer from
        // overwriting a newer one when you flip through pages quickly.
        let ignore = false;

        setLoading(true);
        setError(null);

        async function load() {
            try {
                const offset = (page - 1) * PAGE_SIZE;

                // This list only has names, so load the details for each one.
                const list = await get(`/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
                const pokemon = await loadMany(list.results);

                if (!ignore) {
                    setData({ pokemon, totalPages: Math.ceil(list.count / PAGE_SIZE) });
                    setLoading(false);
                }
            } catch {
                if (!ignore) {
                    setError('We could not load the Pokedex. Please try again.');
                    setLoading(false);
                }
            }
        }

        load();

        // React runs this when `page` changes, or when you leave the page.
        return () => {
            ignore = true;
        };
    }, [page]);

    if (error) {
        return <ErrorMessage title="Could not load Pokemon" text={error} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Discover every Pokemon
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500">
                Browse the Pokedex, filter by type, or search by name and ID. Click any Pokemon to see its
                full stats.
            </p>

            <TypeFilter selectedType="" />

            {loading && <Loading />}

            {!loading && data && (
                <div>
                    {data.pokemon.length === 0 ? <Empty /> : <PokemonGrid pokemon={data.pokemon} />}

                    <Pagination
                        page={page}
                        totalPages={data.totalPages}
                        makeLink={(target) => `/?page=${target}`}
                    />
                </div>
            )}
        </div>
    );
}