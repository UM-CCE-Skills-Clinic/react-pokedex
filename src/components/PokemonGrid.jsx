import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatName, formatNumber } from '../utils';

export function TypeBadge({ type }) {
  return <span>{type}</span>;
}

const EXCLUDED_TYPES = ['unknown', 'shadow', 'stellar'];

export function TypeFilter() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    axios
      .get('https://pokeapi.co/api/v2/type')
      .then((res) => {
        const results = res.data?.results || [];
        const filtered = results.filter((t) => !EXCLUDED_TYPES.includes(t.name));
        setTypes(filtered);
      })
      .catch(() => {
        setTypes([]);
      });
  }, []);

  return (
    <nav>
      <Link to="/">All</Link>
      {types.map((t) => (
        <Link key={t.name} to={`/type/${t.name}`}>
          {formatName(t.name)}
        </Link>
      ))}
    </nav>
  );
}

export default function PokemonGrid({ pokemon = [] }) {
  if (!pokemon || pokemon.length === 0) return null;

  return (
    <div>
      {pokemon.map((p) => (
        <Link key={p.id || p.name} to={`/pokemon/${p.name}`}>
          <div>
            <img src={p.image} alt={p.displayName} />
            <span>#{formatNumber(p.id)}</span>
            <h3>{p.displayName}</h3>
            <div>
              {p.types?.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
