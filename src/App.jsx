import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TypePage from './pages/TypePage';
import PokemonDetailsPage from './pages/PokemonDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/type/:type" element={<TypePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
