import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Discover every Pokemon</h1>
    </div>
  );
}

function SearchPage() {
  return (
    <div>
      <h1>Search results</h1>
    </div>
  );
}

function TypePage() {
  const { type } = useParams();
  return (
    <div>
      <h1>Filtered by type</h1>
      <p>{type}</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div>
      <h1>Page not found</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/type/:type" element={<TypePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
