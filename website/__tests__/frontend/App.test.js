import React from 'react';
import { render } from '@testing-library/react';
import MyComponent from '../../website/src/App';

test('renders component correctly', () => {
  const { getByText } = render(<MyComponent />);
  const linkElement = getByText(/Hello, World!/i);
  expect(linkElement).toBeInTheDocument();
});
