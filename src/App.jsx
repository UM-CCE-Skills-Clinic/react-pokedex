import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout.jsx';
import HomePage from './pages/HomePages.jsx';
import PokemonDetailsPage from './pages/PokemonDetailsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TypePage from './pages/TypePage';
import { ErrorMessage } from './components/ui';

// This is the list of pages in the app, and the address each one lives at.
// ":type" and ":nameOrId" are placeholders - the page reads them with useParams.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Every page inside here is drawn inside Layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/type/:type" element={<TypePage />} />

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