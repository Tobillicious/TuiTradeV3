import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from './ItemCard';
import '@testing-library/jest-dom';

// Mock the timeAgo function to return a consistent value
jest.mock('../../lib/utils', () => ({
  ...jest.requireActual('../../lib/utils'),
  timeAgo: jest.fn(() => '2 days ago'),
}));

const mockItem = {
  id: '123',
  title: 'Test Item',
  price: 99.99,
  imageUrl: 'https://placehold.co/320x400',
  location: 'Auckland',
  userEmail: 'seller@test.com',
  createdAt: {
    toDate: () => new Date(),
  },
  watchCount: 10,
  views: 100,
};

describe('ItemCard', () => {
  const onWatchToggle = jest.fn();
  const onItemClick = jest.fn();
  const onAddToCart = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    onWatchToggle.mockClear();
    onItemClick.mockClear();
    onAddToCart.mockClear();
  });

  test('renders item details correctly', () => {
    render(
      <ItemCard
        item={mockItem}
        isWatched={false}
        onWatchToggle={onWatchToggle}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
        isInCart={false}
      />
    );

    // Check for title, price, and location
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Auckland')).toBeInTheDocument();
    
    // Check for seller info
    expect(screen.getByText('seller')).toBeInTheDocument();

    // Check for stats
    expect(screen.getByText('10')).toBeInTheDocument(); // Watch count
    expect(screen.getByText(/100 views/)).toBeInTheDocument();
  });

  test('calls onItemClick when the card is clicked', () => {
    render(
      <ItemCard
        item={mockItem}
        isWatched={false}
        onWatchToggle={onWatchToggle}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
        isInCart={false}
      />
    );

    fireEvent.click(screen.getByText('Test Item'));
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(mockItem);
  });

  test('calls onWatchToggle when the watch button is clicked', () => {
    render(
      <ItemCard
        item={mockItem}
        isWatched={false}
        onWatchToggle={onWatchToggle}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
        isInCart={false}
      />
    );

    // The watch button is the one with the Heart icon. We can find it by its role.
    const watchButton = screen.getByRole('button');
    fireEvent.click(watchButton);

    expect(onWatchToggle).toHaveBeenCalledTimes(1);
    expect(onWatchToggle).toHaveBeenCalledWith('123');
  });

  test('displays a filled heart icon when the item is watched', () => {
    render(
      <ItemCard
        item={mockItem}
        isWatched={true}
        onWatchToggle={onWatchToggle}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
        isInCart={false}
      />
    );

    const heartIcon = screen.getByRole('button').querySelector('svg');
    // When watched, the 'fill' attribute is 'currentColor'
    expect(heartIcon).toHaveAttribute('fill', 'currentColor');
  });

  test('displays an unfilled heart icon when the item is not watched', () => {
    render(
      <ItemCard
        item={mockItem}
        isWatched={false}
        onWatchToggle={onWatchToggle}
        onItemClick={onItemClick}
        onAddToCart={onAddToCart}
        isInCart={false}
      />
    );

    const heartIcon = screen.getByRole('button').querySelector('svg');
    // When not watched, the 'fill' attribute is 'none'
    expect(heartIcon).toHaveAttribute('fill', 'none');
  });
});
