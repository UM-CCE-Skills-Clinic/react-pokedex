import { Link } from 'react-router-dom';

export function Loading({ text = 'Loading Pokemon...' }) {
  return <div>{text}</div>;
}

export function Empty() {
  return (
    <div>
      <p>No Pokemon found</p>
      <Link to="/">Back to all Pokemon</Link>
    </div>
  );
}

export function ErrorMessage({ title, text }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export function Pagination({ page, totalPages, makeLink }) {
  if (totalPages <= 1) return null;

  return (
    <nav role="navigation">
      {page > 1 && <Link to={makeLink(page - 1)}>← Previous</Link>}
      <span>{page}</span>
      <span>/ {totalPages}</span>
      {page < totalPages && <Link to={makeLink(page + 1)}>Next →</Link>}
    </nav>
  );
}
