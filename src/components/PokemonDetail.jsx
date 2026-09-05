import { formatNumber, getTypeColor } from '../utils';

// The big card on the details page. It is split into small pieces below so
// each part stays short and easy to follow.

// The highest a base stat can go, used to work out how full each bar is.
const MAX_STAT = 255;

function Hero({ pokemon, color }) {
  return (
    <div className="flex flex-col items-center gap-5 p-8" style={{ backgroundColor: color }}>
      <div className="flex w-full items-center justify-between text-white">
        <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold">
          #{formatNumber(pokemon.id)}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <img
        src={pokemon.image}
        alt={pokemon.displayName}
        className="h-56 w-56 object-contain drop-shadow-lg"
      />

      <div className="text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">{pokemon.displayName}</h1>
        <p className="mt-1 text-sm text-white/80">{pokemon.genus}</p>
      </div>
    </div>
  );
}

function Facts({ pokemon }) {
  // Building a list first means we only write the box markup once.
  const facts = [
    { label: 'Height', value: `${pokemon.height} m` },
    { label: 'Weight', value: `${pokemon.weight} kg` },
    { label: 'Capture rate', value: pokemon.captureRate },
    { label: 'Happiness', value: pokemon.baseHappiness }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {fact.label}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}

function Abilities({ abilities }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Abilities</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {abilities.map((ability) => (
          <span
            key={ability.name}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700"
          >
            {ability.name}
            {ability.isHidden && (
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-600">
                Hidden
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats({ pokemon, color }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Base stats</h2>
        <span className="text-sm font-bold text-slate-900">
          Total <span style={{ color }}>{pokemon.totalStats}</span>
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {pokemon.stats.map((stat) => (
          <div key={stat.name} className="grid grid-cols-[72px_1fr_44px] items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">{stat.name}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="stat-bar h-full rounded-full"
                style={{ width: `${(stat.value / MAX_STAT) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-right text-sm font-bold text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PokemonDetail({ pokemon }) {
  const color = getTypeColor(pokemon.types[0]);

  return (
    <article className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
        <Hero pokemon={pokemon} color={color} />

        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Pokedex entry
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">{pokemon.description}</p>
          </div>

          <Facts pokemon={pokemon} />
          <Abilities abilities={pokemon.abilities} />
          <Stats pokemon={pokemon} color={color} />
        </div>
      </div>
    </article>
  );
}
