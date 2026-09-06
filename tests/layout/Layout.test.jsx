import axios from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from '../../src/layout/Layout';

// Render the layout with a couple of fake pages, so we can check that typing
// in the search box actually takes you somewhere.
function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/search" element={<p>Search page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  // The layout itself makes no requests, but this keeps tests quiet.
  vi.spyOn(axios, 'get').mockResolvedValue({ data: { results: [] } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Layout', () => {
  it('shows the header, the page, and the footer', () => {
    renderApp();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('links the logo back home', () => {
    renderApp();

    expect(screen.getByRole('link', { name: /Pokedex/ })).toHaveAttribute('href', '/');
  });

  it('goes to the search page when you search for something', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByRole('textbox'), 'pikachu{Enter}');

    expect(screen.getByText('Search page')).toBeInTheDocument();
  });

  it('goes home when you search for nothing', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByRole('textbox'), '   {Enter}');

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
