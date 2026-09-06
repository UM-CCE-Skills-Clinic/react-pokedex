import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatName,
  formatNumber,
  formatStatName,
  get,
  getTypeColor,
  loadMany,
  loadPokemon
} from '../src/utils';

// A cut-down version of what PokeAPI sends back for one Pokemon.
// Real answers are much bigger, but these are the parts our code reads.
const pikachuResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ type: { name: 'electric' } }],
  abilities: [
    { ability: { name: 'static' }, is_hidden: false },
    { ability: { name: 'lightning-rod' }, is_hidden: true }
  ],
  stats: [
    { stat: { name: 'hp' }, base_stat: 35 },
    { stat: { name: 'special-attack' }, base_stat: 50 }
  ]
};

const pikachuSpecies = {
  flavor_text_entries: [
    { language: { name: 'fr' }, flavor_text: 'Bonjour' },
    { language: { name: 'en' }, flavor_text: 'It raises\nits tail.' }
  ],
  genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }],
  capture_rate: 190,
  base_happiness: 50
};

// Pretend the API returned a 404, the way axios reports it.
const notFoundError = { response: { status: 404 } };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('formatName', () => {
  it('capitalises each word and removes the dashes', () => {
    expect(formatName('mr-mime')).toBe('Mr Mime');
  });

  it('works for a name with no dash', () => {
    expect(formatName('pikachu')).toBe('Pikachu');
  });
});

describe('formatStatName', () => {
  it('uses the short name we picked for known stats', () => {
    expect(formatStatName('hp')).toBe('HP');
    expect(formatStatName('special-attack')).toBe('Sp. Atk');
  });

  it('falls back to normal formatting for anything else', () => {
    expect(formatStatName('some-new-stat')).toBe('Some New Stat');
  });
});

describe('formatNumber', () => {
  it('pads the id out to three digits', () => {
    expect(formatNumber(1)).toBe('001');
    expect(formatNumber(25)).toBe('025');
    expect(formatNumber(150)).toBe('150');
  });

  it('leaves longer ids alone', () => {
    expect(formatNumber(10034)).toBe('10034');
  });
});

describe('getTypeColor', () => {
  it('gives the right colour for a known type', () => {
    expect(getTypeColor('fire')).toBe('#ff9c54');
  });

  it('falls back to grey for an unknown type', () => {
    expect(getTypeColor('banana')).toBe('#9099a1');
  });
});

describe('get', () => {
  it('returns the data from the response', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { name: 'pikachu' } });

    await expect(get('/pokemon/pikachu')).resolves.toEqual({ name: 'pikachu' });
  });

  it('returns null when the thing does not exist', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(notFoundError);

    await expect(get('/pokemon/nope')).resolves.toBeNull();
  });

  it('passes on any other error, because that is a real problem', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    await expect(get('/pokemon/pikachu')).rejects.toThrow('Network Error');
  });
});

describe('loadPokemon', () => {
  it('builds one tidy object out of the two API answers', async () => {
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: pikachuResponse })
      .mockResolvedValueOnce({ data: pikachuSpecies });

    const pokemon = await loadPokemon('pikachu');

    expect(pokemon.id).toBe(25);
    expect(pokemon.displayName).toBe('Pikachu');
    expect(pokemon.types).toEqual(['electric']);
    expect(pokemon.genus).toBe('Mouse Pokemon');

    // The API uses decimetres and hectograms, so these get converted.
    expect(pokemon.height).toBe(0.4);
    expect(pokemon.weight).toBe(6);

    // The official artwork is preferred over the small sprite.
    expect(pokemon.image).toBe('artwork.png');

    // Hidden abilities are marked so the page can show a badge.
    expect(pokemon.abilities).toEqual([
      { name: 'Static', isHidden: false },
      { name: 'Lightning Rod', isHidden: true }
    ]);

    expect(pokemon.stats).toEqual([
      { name: 'HP', value: 35 },
      { name: 'Sp. Atk', value: 50 }
    ]);
    expect(pokemon.totalStats).toBe(85);

    // The English description is used, with its line breaks removed.
    expect(pokemon.description).toBe('It raises its tail.');
  });

  it('returns null when there is no such Pokemon', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(notFoundError);

    await expect(loadPokemon('nope')).resolves.toBeNull();
  });

  it('still works when a special form has no species entry', async () => {
    // Forms like "charizard-mega-x" exist, but their species does not.
    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: pikachuResponse })
      .mockRejectedValueOnce(notFoundError);

    const pokemon = await loadPokemon('charizard-mega-x');

    expect(pokemon.displayName).toBe('Pikachu');
    expect(pokemon.description).toBe('No description available.');
    expect(pokemon.genus).toBe('Unknown');
    expect(pokemon.captureRate).toBe(0);
  });

  it('uses the small sprite when there is no official artwork', async () => {
    const noArtwork = {
      ...pikachuResponse,
      sprites: {
        front_default: 'sprite.png',
        other: { 'official-artwork': { front_default: null } }
      }
    };

    vi.spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: noArtwork })
      .mockResolvedValueOnce({ data: pikachuSpecies });

    const pokemon = await loadPokemon('pikachu');

    expect(pokemon.image).toBe('sprite.png');
  });
});

describe('loadMany', () => {
  // loadMany starts every request at the same time, so we cannot rely on the
  // order they happen in. Instead we answer based on the address being asked for.
  function mockApi({ missing = [] } = {}) {
    vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (missing.some((name) => url.endsWith(`/pokemon/${name}`))) {
        return Promise.reject(notFoundError);
      }
      if (url.includes('/pokemon-species/')) {
        return Promise.resolve({ data: pikachuSpecies });
      }
      return Promise.resolve({ data: pikachuResponse });
    });
  }

  it('loads every Pokemon in the list', async () => {
    mockApi();

    const pokemon = await loadMany([{ name: 'bulbasaur' }, { name: 'pikachu' }]);

    expect(pokemon).toHaveLength(2);
  });

  it('leaves out any Pokemon that could not be found', async () => {
    mockApi({ missing: ['nope'] });

    const pokemon = await loadMany([{ name: 'pikachu' }, { name: 'nope' }]);

    expect(pokemon).toHaveLength(1);
    expect(pokemon[0].displayName).toBe('Pikachu');
  });
});