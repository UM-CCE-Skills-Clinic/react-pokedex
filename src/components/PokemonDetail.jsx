import { formatNumber } from '../utils';

export default function PokemonDetail({ pokemon }) {
  if (!pokemon) return null;

  return (
    <div>
      <h1>{pokemon.displayName}</h1>
      <span>#{formatNumber(pokemon.id)}</span>
      <p>{pokemon.genus}</p>
      <img src={pokemon.image} alt={pokemon.displayName} />
      <p>{pokemon.description}</p>

      <div>
        <span>{pokemon.height} m</span>
        <span>{pokemon.weight} kg</span>
        <span>{pokemon.captureRate}</span>
        <span>{pokemon.baseHappiness}</span>
      </div>

      <div>
        <h3>Abilities</h3>
        {pokemon.abilities?.map((a) => (
          <div key={a.name}>
            <span>{a.name}</span>
            {a.isHidden && <span>Hidden</span>}
          </div>
        ))}
      </div>

      <div>
        <h3>Stats</h3>
        {pokemon.stats?.map((s) => (
          <div key={s.name}>
            <span>{s.name}</span>
            <span>{s.value}</span>
          </div>
        ))}
        <div>
          <span>Total</span>
          <span>{pokemon.totalStats}</span>
        </div>
      </div>
    </div>
  );
}
