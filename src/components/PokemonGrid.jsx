import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatName, formatNumber, get, getTypeColor } from '../utils';

// A coloured pill showing one type, for example "fire".
export function TypeBadge({ type }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: getTypeColor(type) }}
    >
      {type}
    </span>
  );
}

// The row of type filters above the grid.
// It loads its own list, so the pages using it do not have to.
export function TypeFilter({ selectedType }) {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const data = await get('/type');

      // These exist in the API but have no Pokemon, so they make bad filters.
      const notRealTypes = ['unknown', 'shadow', 'stellar'];

      if (!ignore) {
        setTypes(
          data.results
            .filter((type) => !notRealTypes.includes(type.name))
            .map((type) => ({ name: type.name, displayName: formatName(type.name) }))
        );
      }
    }

    // The filters are a nice extra, so if they fail we just show none.
    load().catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
      <Link
        to="/"
        className={
          selectedType
            ? 'shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200'
            : 'shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
        }
      >
        All
      </Link>

      {types.map((type) => {
        const isSelected = selectedType === type.name;

        return (
          <Link
            key={type.name}
            to={`/type/${type.name}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${
              isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: getTypeColor(type.name) }}
          >
            {type.displayName}
          </Link>
        );
      })}
    </nav>
  );
}

// One clickable Pokemon card.
function PokemonCard({ pokemon }) {
  // Cards are tinted with the colour of the Pokemon's first type.
  const color = getTypeColor(pokemon.types[0]);

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className="relative flex h-40 items-center justify-center"
        style={{ backgroundColor: `${color}22` }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-slate-500">
          #{formatNumber(pokemon.id)}
        </span>
        <img
          src={pokemon.image}
          alt={pokemon.displayName}
          loading="lazy"
          className="h-32 w-32 object-contain"
        />
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <h3 className="font-bold text-slate-900">{pokemon.displayName}</h3>
        <div className="flex flex-wrap gap-1.5">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </Link>
  );
}

// The grid of cards. `key` tells React which card is which when the list changes.
export default function PokemonGrid({ pokemon }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pokemon.map((item) => (
        <PokemonCard key={item.id} pokemon={item} />
      ))}
    </div>
  );
}