import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import PokemonDetailsPage from './pages/PokemonDetailsPage';   // ← add this
import { ErrorMessage } from './components/ui';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />   {/* ← add this */}

          <Route
            path="*"
            element={
              <ErrorMessage
                title="Page not found"
                text="The page you are looking for does not exist."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}