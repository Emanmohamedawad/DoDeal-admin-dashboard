import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import '@testing-library/jest-dom'; // Import jest-dom matchers

describe('Button', () => {
  test('renders with default text', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with different text', () => {
    render(<Button>Submit Form</Button>);
    const buttonElement = screen.getByText(/Submit Form/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn(); // Create a mock function
    render(<Button onClick={handleClick}>Test Button</Button>);
    const buttonElement = screen.getByText(/Test Button/i);
    fireEvent.click(buttonElement); // Simulate a click
    expect(handleClick).toHaveBeenCalledTimes(1); // Check if the mock function was called once
  });

  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    const buttonElement = screen.getByText(/Disabled Button/i);
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled(); // Ensure the mock function was not called
    expect(buttonElement).toBeDisabled(); // Check if the button is disabled
  });

  test('applies custom className', () => {
    render(<Button className="custom-style">Styled Button</Button>);
    const buttonElement = screen.getByText(/Styled Button/i);
    expect(buttonElement).toHaveClass('custom-style'); // Check if the custom class is applied
  });

  test('renders with type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByText(/Submit/i);
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });
});