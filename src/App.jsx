import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/Homepage';
import PokemonDetailsPage from './pages/PokemonDetailsPage';
import { ErrorMessage } from './components/ui';

// This is the list of pages in the app, and the address each one lives at.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />

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