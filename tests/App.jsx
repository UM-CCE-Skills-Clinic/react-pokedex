import axios from 'axios';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';

// App uses BrowserRouter, which reads the real address bar. jsdom gives us a
// fake one, so we set the address before rendering.
function goTo(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

beforeEach(() => {
  // Every page loads something. These are the emptiest answers each address
  // can give, which is enough to check that the right page is shown.
  vi.spyOn(axios, 'get').mockImplementation((url) => {
    if (url.endsWith('/type')) {
      return Promise.resolve({ data: { results: [] } });
    }
    if (url.includes('/type/')) {
      return Promise.resolve({ data: { pokemon: [] } });
    }
    if (url.includes('/pokemon?')) {
      return Promise.resolve({ data: { count: 0, results: [] } });
    }
    // Looking up one Pokemon by name: pretend there is no such Pokemon.
    return Promise.reject({ response: { status: 404 } });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.pushState({}, '', '/');
});

describe('App routes', () => {
  it('shows the home page at /', async () => {
    goTo('/');

    expect(await screen.findByText('Discover every Pokemon')).toBeInTheDocument();
  });

  it('shows the search page at /search', async () => {
    goTo('/search?q=pikachu');

    expect(await screen.findByText('Search results')).toBeInTheDocument();
  });

  it('shows the type page at /type/:type', async () => {
    goTo('/type/ghost');

    expect(await screen.findByText('Filtered by type')).toBeInTheDocument();
  });

  it('shows a not found message for an address we do not have', async () => {
    goTo('/this-page-does-not-exist');

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
