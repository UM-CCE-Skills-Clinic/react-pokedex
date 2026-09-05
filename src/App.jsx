import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import { ErrorMessage } from './components/ui';
import PokemonDetailsPage from './pages/PokemonDetailsPage';   // ← add this
import SearchPage from './pages/SearchPage';                   // ← add this


// This is the list of pages in the app, and the address each one lives at.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />   {/* ← add this */}
          <Route path="/search" element={<SearchPage />} />     {/* ← add this */}

          {/* "*" matches any address we did not list above. */}
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