import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <header role="banner">
        <nav>
          <Link to="/">Pokedex</Link>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer role="contentinfo">
        <p>Pokedex Application</p>
      </footer>
    </div>
  );
}
