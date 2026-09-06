import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Empty, ErrorMessage, Loading, Pagination } from '../../src/components/ui';

// These components use <Link>, which only works inside a router.
// MemoryRouter is a pretend router for tests.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Loading', () => {
  it('shows the default message', () => {
    renderWithRouter(<Loading />);

    expect(screen.getByText('Loading Pokemon...')).toBeInTheDocument();
  });

  it('shows a message we pass in', () => {
    renderWithRouter(<Loading text="Searching..." />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });
});

describe('Empty', () => {
  it('explains that nothing was found and links home', () => {
    renderWithRouter(<Empty />);

    expect(screen.getByText('No Pokemon found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to all Pokemon' })).toHaveAttribute('href', '/');
  });
});

describe('ErrorMessage', () => {
  it('shows the title and text it is given', () => {
    renderWithRouter(<ErrorMessage title="Page not found" text="That page does not exist." />);

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText('That page does not exist.')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  const makeLink = (page) => `/?page=${page}`;

  it('shows nothing when there is only one page', () => {
    const { container } = renderWithRouter(
      <Pagination page={1} totalPages={1} makeLink={makeLink} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows which page you are on', () => {
    renderWithRouter(<Pagination page={2} totalPages={5} makeLink={makeLink} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('/ 5')).toBeInTheDocument();
  });

  it('has no Previous link on the first page', () => {
    renderWithRouter(<Pagination page={1} totalPages={5} makeLink={makeLink} />);

    expect(screen.queryByRole('link', { name: '← Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next →' })).toHaveAttribute('href', '/?page=2');
  });

  it('has no Next link on the last page', () => {
    renderWithRouter(<Pagination page={5} totalPages={5} makeLink={makeLink} />);

    expect(screen.queryByRole('link', { name: 'Next →' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Previous' })).toHaveAttribute('href', '/?page=4');
  });

  it('links both ways in the middle', () => {
    renderWithRouter(<Pagination page={3} totalPages={5} makeLink={makeLink} />);

    expect(screen.getByRole('link', { name: '← Previous' })).toHaveAttribute('href', '/?page=2');
    expect(screen.getByRole('link', { name: 'Next →' })).toHaveAttribute('href', '/?page=4');
  });
});
