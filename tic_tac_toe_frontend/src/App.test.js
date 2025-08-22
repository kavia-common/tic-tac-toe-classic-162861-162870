import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
});

test('can click a cell and place X', () => {
  render(<App />);
  const cells = screen.getAllByRole('button', { name: /Cell/i });
  fireEvent.click(cells[0]);
  expect(cells[0]).toHaveTextContent('X');
});
